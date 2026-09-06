import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { FaSnowflake } from "react-icons/fa";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import { initHeadingWipe, prefersReducedMotion } from "../../utils/motion";
import { setTag, trackEvent, upgradeSession } from "../../utils/clarity";
import {
	PRESET_QUERIES,
	SCHEMA,
	registerTables,
} from "../../utils/sql-tables";

type RunSource = "preset" | "custom";

interface IStatus {
	kind: "idle" | "loading" | "ok" | "error";
	text: string;
	detail?: string;
}

const MAX_RENDERED_ROWS = 50;

const SqlTerminalSection = () => {
	const sectionRef = useRef<HTMLElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);
	const engineRef = useRef<any>(null);
	const pendingRef = useRef<{ sql: string; source: RunSource } | null>(null);
	const customRunsRef = useRef(0);

	const [query, setQuery] = useState(PRESET_QUERIES[0].sql);
	const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
	const [status, setStatus] = useState<IStatus>({
		kind: "idle",
		text: "press Run — the warehouse is all yours",
	});
	const [isNear, setIsNear] = useState(false);
	const [schemaOpen, setSchemaOpen] = useState(false);

	const execute = useCallback((rawSql: string, source: RunSource) => {
		const sql = rawSql.trim().replace(/;+\s*$/, "");
		if (!sql) return;

		const fail = (text: string, detail?: string) => {
			setRows(null);
			setStatus({ kind: "error", text, detail });
			trackEvent("sql_query_error", { source });
		};

		// Guardrails + easter eggs, checked before the engine even loads
		if (/\bsalary\b/i.test(sql)) {
			return fail(
				'ERROR: permission denied for table "salary"',
				"That dataset is only served over coffee — the chat button in the hero is the access request form. ☕"
			);
		}
		if (/^(drop|delete|update|insert|truncate|alter|create|merge)\b/i.test(sql)) {
			return fail(
				"ERROR: read-only warehouse",
				"My career is append-only — no destructive DML allowed. Try a SELECT."
			);
		}
		if (sql.indexOf(";") !== -1) {
			return fail(
				"ERROR: one statement at a time",
				"This is a portfolio, not a migration script."
			);
		}
		if (!/^(select|show|with)\b/i.test(sql)) {
			return fail(
				"ERROR: unsupported statement",
				"Only SELECT (or SHOW TABLES) runs here. Check the schema panel for what's queryable."
			);
		}

		if (!engineRef.current) {
			pendingRef.current = { sql, source };
			setIsNear(true);
			setStatus({ kind: "loading", text: "warming up the warehouse…" });
			return;
		}

		try {
			const t0 = performance.now();
			const result = engineRef.current(sql);
			const elapsed = Math.round(
				performance.now() - t0 + 18 + Math.random() * 60
			);
			const data: Record<string, unknown>[] = Array.isArray(result)
				? result
				: [];
			setRows(data);
			setStatus({
				kind: "ok",
				text:
					data.length === 0
						? `✓ 0 rows · ${elapsed} ms — even my failures are well-indexed`
						: `✓ ${data.length} row${data.length === 1 ? "" : "s"} · ${elapsed} ms`,
			});
			trackEvent("sql_query_run", { source, success: true });
			if (source === "custom") {
				setTag("sql_query", sql.slice(0, 120));
				customRunsRef.current += 1;
				if (customRunsRef.current === 1) upgradeSession("sql_terminal_use");
			}
		} catch (e) {
			const raw = e instanceof Error ? e.message : String(e);
			const friendly = /not (found|exist)/i.test(raw)
				? "ERROR: relation not found"
				: "ERROR: query failed to compile";
			fail(
				friendly,
				`${raw} — SHOW TABLES lists everything queryable (I document my schemas; see testimonials).`
			);
		}
	}, []);

	// Lazily pull AlaSQL only once the section nears the viewport (quote2/typed.js pattern)
	useEffect(() => {
		if (!isNear || engineRef.current) return;
		let cancelled = false;
		import("alasql").then((mod) => {
			if (cancelled) return;
			const alasql = (mod as any).default || mod;
			registerTables(alasql);
			engineRef.current = alasql;
			if (pendingRef.current) {
				const pending = pendingRef.current;
				pendingRef.current = null;
				execute(pending.sql, pending.source);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [isNear, execute]);

	// Entrance choreography + near-viewport engine preload trigger
	useEffect(() => {
		if (!sectionRef.current) return;
		const triggers: ScrollTrigger[] = [];

		const wipe = initHeadingWipe(sectionRef.current);
		if (wipe) triggers.push(wipe);

		if (!prefersReducedMotion() && cardRef.current) {
			const card = cardRef.current;
			const chips = sectionRef.current.querySelectorAll(".sql-chip");
			gsap.set(card, { opacity: 0, y: 50, scale: 0.96 });
			gsap.set(chips, { opacity: 0, y: 12 });
			triggers.push(
				ScrollTrigger.create({
					trigger: card,
					start: "top 85%",
					once: true,
					onEnter: () => {
						gsap.to(card, {
							opacity: 1,
							y: 0,
							scale: 1,
							duration: 0.7,
							ease: "back.out(1.2)",
						});
						gsap.to(chips, {
							opacity: 1,
							y: 0,
							duration: 0.4,
							stagger: 0.06,
							delay: 0.15,
							ease: "power2.out",
						});
					},
				})
			);
		}

		triggers.push(
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top 120%",
				once: true,
				onEnter: () => setIsNear(true),
			})
		);

		return () => triggers.forEach((t) => t.kill());
	}, []);

	// New result rows stagger in
	useEffect(() => {
		if (!rows || !rows.length || prefersReducedMotion()) return;
		const els = resultsRef.current?.querySelectorAll(".sql-row");
		if (els && els.length) {
			gsap.fromTo(
				els,
				{ opacity: 0, y: 8 },
				{
					opacity: 1,
					y: 0,
					stagger: 0.03,
					duration: 0.25,
					ease: "power2.out",
					overwrite: true,
				}
			);
		}
	}, [rows]);

	// Auto-grow the editor with its content (capped)
	useEffect(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		ta.style.height = "auto";
		ta.style.height = `${Math.min(ta.scrollHeight, 320)}px`;
	}, [query]);

	const runPreset = (label: string, sql: string) => {
		setQuery(sql);
		trackEvent("sql_preset_click", { preset: label });
		execute(sql, "preset");
	};

	const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			execute(query, "custom");
		}
	};

	const syncScroll = () => {
		if (preRef.current && textareaRef.current) {
			preRef.current.scrollTop = textareaRef.current.scrollTop;
			preRef.current.scrollLeft = textareaRef.current.scrollLeft;
		}
	};

	const columns = rows && rows.length ? Object.keys(rows[0]) : [];
	const visibleRows = rows ? rows.slice(0, MAX_RENDERED_ROWS) : [];

	return (
		<section
			ref={sectionRef}
			id="sql"
			className="w-full relative section-container py-8 md:py-12 flex flex-col"
		>
			<div className="flex flex-col mb-10">
				<h2 className="section-heading seq">Query my career</h2>
				<h3 className="text-2xl md:max-w-2xl w-full seq mt-2 text-gray-200">
					1000+ SQL questions solved — run one yourself. Real data, real SQL,
					zero warehouse bill.
				</h3>
			</div>

			<div
				ref={cardRef}
				className="sql-terminal rounded-2xl overflow-hidden bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 transition-all duration-[10ms] hover:border-[#9146FF]/40 hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)]"
			>
				{/* Title bar */}
				<div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/70 bg-gray-900/60">
					<div className="flex gap-1.5" aria-hidden="true">
						<span className="w-3 h-3 rounded-full bg-red-500/80"></span>
						<span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
						<span className="w-3 h-3 rounded-full bg-green-500/80"></span>
					</div>
					<span className="font-mono text-xs text-gray-400 flex items-center gap-2">
						<FaSnowflake
							className="text-[#29B5E8] text-sm"
							aria-hidden="true"
						/>
						markpham_dw · connected
						<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
					</span>
					<button
						type="button"
						onClick={() => setSchemaOpen((v) => !v)}
						className="ml-auto font-mono text-xs text-[#BF94FF] hover:text-white transition-colors duration-[10ms]"
						aria-expanded={schemaOpen}
					>
						schema {schemaOpen ? "▴" : "▾"}
					</button>
				</div>

				{/* Schema panel */}
				{schemaOpen && (
					<div className="px-4 py-3 border-b border-gray-800/70 bg-gray-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{SCHEMA.map((t) => (
							<div key={t.table} className="font-mono text-xs">
								<button
									type="button"
									onClick={() => {
										setQuery(`SELECT * FROM ${t.table} LIMIT 10;`);
										textareaRef.current?.focus();
									}}
									className="text-[#BF94FF] font-semibold hover:text-white transition-colors duration-[10ms]"
									title={`SELECT * FROM ${t.table}`}
								>
									{t.table}
								</button>
								<div className="mt-1 text-gray-400 leading-relaxed">
									{t.columns.join(" · ")}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Preset chips */}
				<div className="flex gap-2 px-4 pt-4 overflow-x-auto pb-1">
					{PRESET_QUERIES.map((p) => (
						<button
							key={p.label}
							type="button"
							onClick={() => runPreset(p.label, p.sql)}
							className="sql-chip whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full bg-[#9146FF]/15 text-[#BF94FF] border border-[#9146FF]/20 hover:bg-[#9146FF]/30 hover:border-[#9146FF]/50 transition-all duration-[10ms]"
						>
							{p.label}
						</button>
					))}
				</div>

				{/* Editor: transparent textarea over a Prism-highlighted mirror */}
				<div className="relative m-4 rounded-xl bg-gray-950/80 border border-gray-800/70 focus-within:border-[#9146FF]/50 transition-colors duration-[10ms]">
					<pre
						ref={preRef}
						aria-hidden="true"
						className="sql-editor-metrics pointer-events-none absolute inset-0 m-0 overflow-hidden"
					>
						<code
							dangerouslySetInnerHTML={{
								__html: Prism.highlight(
									query + "\n",
									Prism.languages.sql,
									"sql"
								),
							}}
						/>
					</pre>
					<textarea
						ref={textareaRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={onEditorKeyDown}
						onScroll={syncScroll}
						spellCheck={false}
						autoCapitalize="off"
						autoCorrect="off"
						rows={4}
						aria-label="SQL query editor"
						className="sql-editor-metrics relative block w-full resize-none bg-transparent text-transparent caret-[#BF94FF] outline-none selection:bg-[#9146FF]/40"
					/>
				</div>

				{/* Run + status */}
				<div className="flex flex-wrap items-center gap-4 px-4 pb-4">
					<button
						type="button"
						onClick={() => execute(query, "custom")}
						className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#9146FF] text-white text-sm font-semibold hover:bg-[#7c3aed] hover:shadow-[0_8px_24px_-8px_rgba(145,70,255,0.6)] transition-all duration-[10ms]"
					>
						▸ Run
						<span className="hidden md:inline font-mono text-[10px] opacity-70 border border-white/30 rounded px-1">
							⌘↵
						</span>
					</button>
					<span
						role="status"
						className={`font-mono text-xs ${
							status.kind === "ok"
								? "text-green-400"
								: status.kind === "error"
								? "text-red-400"
								: "text-gray-400"
						}`}
					>
						{status.text}
					</span>
				</div>

				{/* Error detail */}
				{status.kind === "error" && status.detail && (
					<div className="mx-4 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-300 leading-relaxed">
						{status.detail}
					</div>
				)}

				{/* Results */}
				{rows && rows.length > 0 && (
					<div ref={resultsRef} className="px-4 pb-4">
						<div className="rounded-xl border border-gray-800/70 overflow-hidden">
							<div className="overflow-x-auto max-h-80 overflow-y-auto">
								<table className="w-full font-mono text-xs md:text-sm text-left">
									<thead>
										<tr className="sticky top-0 z-10">
											{columns.map((c) => (
												<th
													key={c}
													className="bg-gray-900 text-[#BF94FF] font-semibold px-3 py-2 border-b border-[#9146FF]/30 whitespace-nowrap"
												>
													{c}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{visibleRows.map((row, i) => (
											<tr
												key={i}
												className="sql-row odd:bg-gray-900/40 hover:bg-[#9146FF]/10 transition-colors duration-[10ms]"
											>
												{columns.map((c) => (
													<td
														key={c}
														className="px-3 py-2 border-b border-gray-800/50 text-gray-300 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis"
													>
														{row[c] === null || row[c] === undefined ? (
															<span className="text-gray-400">NULL</span>
														) : (
															String(row[c])
														)}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
						{rows.length > MAX_RENDERED_ROWS && (
							<p className="mt-2 font-mono text-xs text-gray-400">
								showing {MAX_RENDERED_ROWS} of {rows.length} rows
							</p>
						)}
					</div>
				)}
			</div>
		</section>
	);
};

export default SqlTerminalSection;
