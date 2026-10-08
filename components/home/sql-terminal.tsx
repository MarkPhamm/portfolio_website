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
import { prefersReducedMotion, revealUp } from "../../utils/motion";
import SectionHeader from "../common/section-header";
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

		// The window rises in, then the preset chips follow.
		const cleanups = [
			revealUp(cardRef.current, { y: 40 }),
			revealUp(sectionRef.current.querySelectorAll(".sql-chip"), { y: 10, stagger: 0.04, start: "top 92%" }),
		];

		triggers.push(
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top 120%",
				once: true,
				onEnter: () => setIsNear(true),
			})
		);

		return () => {
			triggers.forEach((t) => t.kill());
			cleanups.forEach((fn) => fn());
		};
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
			className="w-full relative section-container py-24 md:py-36 flex flex-col"
		>
			<SectionHeader
				index="02"
				eyebrow="Query me"
				title="Query my career"
				tagline="1000+ SQL questions solved — run one yourself. Real data, real SQL, zero warehouse bill."
				className="mb-12 md:mb-16"
			/>

			<div className="relative">
			<div
				ref={cardRef}
				className="sql-terminal relative rounded-[24px] overflow-hidden bg-surface-1 border border-line shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-colors duration-[10ms] hover:border-line-strong"
			>
				{/* Title bar */}
				<div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-surface-2/60">
					<div className="flex gap-1.5" aria-hidden="true">
						<span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]"></span>
						<span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]"></span>
						<span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]"></span>
					</div>
					<span className="font-mono text-[11px] text-ink-3 flex items-center gap-2">
						<FaSnowflake
							className="text-[#29B5E8] text-sm"
							aria-hidden="true"
						/>
						markpham_dw · connected
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153/0.8)] animate-pulse"></span>
					</span>
					<button
						type="button"
						onClick={() => setSchemaOpen((v) => !v)}
						className="ml-auto font-mono text-[11px] uppercase tracking-[0.12em] text-violet-soft hover:text-ink-1 transition-colors duration-[10ms]"
						aria-expanded={schemaOpen}
					>
						schema {schemaOpen ? "▴" : "▾"}
					</button>
				</div>

				{/* Schema panel */}
				{schemaOpen && (
					<div className="px-4 py-4 border-b border-line bg-surface-2/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{SCHEMA.map((t) => (
							<div key={t.table} className="font-mono text-xs">
								<button
									type="button"
									onClick={() => {
										setQuery(`SELECT * FROM ${t.table} LIMIT 10;`);
										textareaRef.current?.focus();
									}}
									className="text-violet-soft font-semibold hover:text-ink-1 transition-colors duration-[10ms]"
									title={`SELECT * FROM ${t.table}`}
								>
									{t.table}
								</button>
								<div className="mt-1 text-ink-3 leading-relaxed">
									{t.columns.join(" · ")}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Preset chips */}
				<div className="flex gap-2 px-4 pt-4 overflow-x-auto pb-1" data-lenis-prevent-horizontal>
					{PRESET_QUERIES.map((p) => (
						<button
							key={p.label}
							type="button"
							onClick={() => runPreset(p.label, p.sql)}
							className="sql-chip whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-line bg-white/[0.02] text-ink-2 hover:border-line-strong hover:bg-white/[0.05] hover:text-ink-1 transition-colors duration-[10ms]"
						>
							{p.label}
						</button>
					))}
				</div>

				{/* Editor: transparent textarea over a Prism-highlighted mirror */}
				<div className="relative m-4 rounded-xl bg-gray-950/80 border border-line focus-within:border-violet/50 transition-colors duration-[10ms]">
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
						className="sql-editor-metrics relative block w-full resize-none bg-transparent text-transparent caret-violet-soft outline-none selection:bg-violet/40"
					/>
				</div>

				{/* Run + status */}
				<div className="flex flex-wrap items-center gap-4 px-4 pb-4">
					<button
						type="button"
						onClick={() => execute(query, "custom")}
						className="btn-pill btn-primary no-disc h-10 gap-2 px-5 text-sm"
					>
						▸ Run
						<span className="hidden md:inline font-mono text-[10px] opacity-60 border border-black/25 rounded px-1">
							⌘↵
						</span>
					</button>
					<span
						role="status"
						className={`font-mono text-xs ${
							status.kind === "ok"
								? "text-emerald-400"
								: status.kind === "error"
								? "text-red-400"
								: "text-ink-3"
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
						<div className="rounded-xl border border-line overflow-hidden">
							<div className="overflow-x-auto max-h-80 overflow-y-auto">
								<table className="w-full font-mono text-xs md:text-sm text-left">
									<thead>
										<tr className="sticky top-0 z-10">
											{columns.map((c) => (
												<th
													key={c}
													className="bg-surface-2 text-ink-3 font-normal uppercase tracking-[0.08em] text-[11px] px-3 py-2.5 border-b border-line whitespace-nowrap"
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
												className="sql-row odd:bg-white/[0.02] hover:bg-violet/10 transition-colors duration-[10ms]"
											>
												{columns.map((c) => (
													<td
														key={c}
														className="px-3 py-2 border-b border-line text-ink-2 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis"
													>
														{row[c] === null || row[c] === undefined ? (
															<span className="text-ink-3">NULL</span>
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
							<p className="mt-2 font-mono text-xs text-ink-3">
								showing {MAX_RENDERED_ROWS} of {rows.length} rows
							</p>
						)}
					</div>
				)}
			</div>
			</div>
		</section>
	);
};

export default SqlTerminalSection;
