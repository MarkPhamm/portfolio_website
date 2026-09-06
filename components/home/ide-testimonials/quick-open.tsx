import React, { useEffect, useMemo, useRef, useState } from "react";
import { VscMarkdown, VscSearch } from "react-icons/vsc";
import { FILES, folderColor, ITestimonialFile } from "./files";

// In-order subsequence match with a consecutive-run bonus; returns matched
// character indices for highlighting, or null when it doesn't match.
const fuzzyMatch = (
	query: string,
	target: string
): { score: number; indices: number[] } | null => {
	const q = query.toLowerCase();
	const t = target.toLowerCase();
	const indices: number[] = [];
	let from = 0;
	let score = 0;
	let streak = 0;
	for (const ch of q) {
		const found = t.indexOf(ch, from);
		if (found === -1) return null;
		streak = found === from ? streak + 1 : 1;
		score += streak;
		indices.push(found);
		from = found + 1;
	}
	return { score, indices };
};

const Highlighted = ({
	text,
	indices,
}: {
	text: string;
	indices: number[];
}) => {
	const set = new Set(indices);
	return (
		<>
			{text.split("").map((ch, i) =>
				set.has(i) ? (
					<span key={i} className="text-[#BF94FF] font-semibold">
						{ch}
					</span>
				) : (
					<span key={i}>{ch}</span>
				)
			)}
		</>
	);
};

const QuickOpen = ({
	onOpen,
	onClose,
}: {
	onOpen: (file: ITestimonialFile) => void;
	onClose: () => void;
}) => {
	const [query, setQuery] = useState("");
	const [highlightIdx, setHighlightIdx] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		inputRef.current?.focus({ preventScroll: true });
	}, []);

	const results = useMemo(() => {
		const q = query.trim();
		if (!q) return FILES.map((file) => ({ file, indices: [] as number[] }));
		return FILES.map((file) => {
			const m =
				fuzzyMatch(q, file.fileName) ||
				// fall back to matching the display name (indices then only
				// highlight when the fileName itself matched)
				(fuzzyMatch(q, file.displayName)
					? { score: 0, indices: [] as number[] }
					: null);
			return m ? { file, indices: m.indices, score: m.score } : null;
		})
			.filter(Boolean as unknown as <T>(x: T | null) => x is T)
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
	}, [query]);

	// Clamp the highlight when the result list shrinks
	useEffect(() => {
		setHighlightIdx((i) => Math.min(i, Math.max(results.length - 1, 0)));
	}, [results.length]);

	// Keep the highlighted row scrolled into view
	useEffect(() => {
		listRef.current
			?.querySelectorAll("button")
			[highlightIdx]?.scrollIntoView({ block: "nearest" });
	}, [highlightIdx]);

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightIdx((i) => (i + 1) % Math.max(results.length, 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightIdx(
				(i) =>
					(i - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1)
			);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const hit = results[highlightIdx];
			if (hit) {
				onOpen(hit.file);
				onClose();
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			onClose();
		}
	};

	return (
		<>
			{/* Backdrop confined to the IDE window */}
			<div
				className="absolute inset-0 z-20 bg-gray-950/40"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[min(420px,92%)] rounded-lg border border-gray-700 bg-gray-950 shadow-2xl shadow-black/60 overflow-hidden">
				<div className="flex items-center gap-2 px-3 border-b border-gray-800">
					<VscSearch className="text-gray-500 shrink-0" aria-hidden="true" />
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setHighlightIdx(0);
						}}
						onKeyDown={onKeyDown}
						placeholder="Search recommendations by name…"
						spellCheck={false}
						aria-label="Quick open — search recommendation files"
						className="w-full bg-transparent font-mono text-sm text-gray-200 placeholder-gray-600 outline-none py-2.5"
					/>
				</div>
				<div ref={listRef} className="max-h-64 overflow-y-auto ide-scroll py-1">
					{results.length === 0 && (
						<p className="px-4 py-3 font-mono text-xs text-gray-400">
							no matching files — try a first name
						</p>
					)}
					{results.map(({ file, indices }, i) => (
						<button
							key={file.id}
							type="button"
							onClick={() => {
								onOpen(file);
								onClose();
							}}
							onMouseMove={() => setHighlightIdx(i)}
							className={`w-full flex items-baseline gap-2 px-4 py-1.5 font-mono text-xs text-left transition-colors duration-[10ms] ${
								i === highlightIdx
									? "bg-[#9146FF]/20 text-white"
									: "text-gray-300"
							}`}
						>
							<VscMarkdown
								className="shrink-0 self-center"
								style={{ color: folderColor(file.folder) }}
								aria-hidden="true"
							/>
							<span className="whitespace-nowrap">
								<Highlighted text={file.fileName} indices={indices} />
							</span>
							<span className="ml-auto text-gray-600 truncate">
								{file.role}
							</span>
						</button>
					))}
				</div>
			</div>
		</>
	);
};

export default QuickOpen;
