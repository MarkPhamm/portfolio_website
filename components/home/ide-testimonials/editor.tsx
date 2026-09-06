import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import Image from "next/image";
import { VscChevronRight, VscFolderOpened, VscMarkdown } from "react-icons/vsc";
import { prefersReducedMotion } from "../../../utils/motion";
import { folderColor, ITestimonialFile } from "./files";

// Line count for a rendered file: 5 frontmatter lines + 1 blank + quote lines
export const lineCount = (file: ITestimonialFile): number =>
	6 + file.quoteLines.length;

// Human-ish typing, brisk: 2–4 chars per keystroke, 16–40ms between
// keystrokes, with the occasional longer "thinking" pause. ~110 chars/s.
const nextBurst = () => 2 + Math.floor(Math.random() * 3);
const nextDelay = () =>
	Math.random() < 0.025
		? 140 + Math.random() * 160 // brief pause, like a real writer
		: 16 + Math.random() * 24;

interface ISeg {
	t: string;
	cls?: string;
	style?: React.CSSProperties;
	noSelect?: boolean;
}

interface ILineModel {
	segs: ISeg[];
	highlight?: boolean;
	frontmatter?: boolean;
}

const lineLen = (line: ILineModel) =>
	line.segs.reduce((sum, seg) => sum + seg.t.length, 0);

const buildLines = (file: ITestimonialFile, color: string): ILineModel[] => [
	{ frontmatter: true, segs: [{ t: "---", cls: "text-gray-500" }] },
	{
		frontmatter: true,
		segs: [
			{ t: "author", cls: "text-[#BF94FF]" },
			{ t: ": ", cls: "text-gray-500" },
			{ t: `"${file.displayName}"`, cls: "text-emerald-300" },
		],
	},
	{
		frontmatter: true,
		segs: [
			{ t: "role", cls: "text-[#BF94FF]" },
			{ t: ": ", cls: "text-gray-500" },
			{ t: `"${file.role}"`, cls: "text-sky-300" },
		],
	},
	{
		frontmatter: true,
		segs: [
			{ t: "tags", cls: "text-[#BF94FF]" },
			{ t: ": [", cls: "text-gray-500" },
			{ t: file.tag, cls: "text-amber-300" },
			{ t: ", ", cls: "text-gray-500" },
			{ t: file.folder, style: { color } },
			{ t: "]", cls: "text-gray-500" },
		],
	},
	{ frontmatter: true, segs: [{ t: "---", cls: "text-gray-500" }] },
	{ segs: [{ t: " " }] },
	...file.quoteLines.map((line, i) => ({
		highlight: i === 0,
		segs: [
			{ t: "> ", cls: "text-[#BF94FF]/70", noSelect: true },
			{ t: line, cls: "text-gray-200" },
		],
	})),
];

// Render a line's segments, truncated to `visible` characters
const renderSegs = (segs: ISeg[], visible: number) => {
	const out: React.ReactNode[] = [];
	let remaining = visible;
	for (let i = 0; i < segs.length && remaining > 0; i++) {
		const seg = segs[i];
		const text = seg.t.slice(0, remaining);
		remaining -= seg.t.length;
		out.push(
			<span
				key={i}
				className={`${seg.cls ?? ""}${seg.noSelect ? " select-none" : ""}`}
				style={seg.style}
			>
				{text}
			</span>
		);
	}
	return out;
};

const Caret = () => (
	<span
		className="ide-caret inline-block w-[8px] h-[15px] align-text-bottom bg-[#BF94FF] ml-px"
		aria-hidden="true"
	/>
);

const Editor = ({ file }: { file: ITestimonialFile | null }) => {
	const paneRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Typing starts only once the pane has scrolled into view; until then the
	// initial file renders in full (also keeps the SSR HTML crawlable).
	const armedRef = useRef(false);
	const prevIdRef = useRef(file?.id ?? null);

	const lines = useMemo(
		() => (file ? buildLines(file, folderColor(file.folder)) : []),
		[file]
	);
	const total = useMemo(
		() => lines.reduce((sum, l) => sum + lineLen(l), 0),
		[lines]
	);
	// Frontmatter (5 lines + blank) appears instantly — only the review itself
	// is "typed" by the reviewer.
	const preLen = useMemo(
		() => lines.slice(0, 6).reduce((sum, l) => sum + lineLen(l), 0),
		[lines]
	);

	const totalRef = useRef(total);
	totalRef.current = total;
	const preLenRef = useRef(preLen);
	preLenRef.current = preLen;

	const [shown, setShown] = useState(total);

	const type = useCallback((target: number, from: number) => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		setShown(from);
		const tick = () => {
			let done = false;
			setShown((s) => {
				const next = Math.min(s + nextBurst(), target);
				done = next >= target;
				return next;
			});
			if (!done) timeoutRef.current = setTimeout(tick, nextDelay());
			else timeoutRef.current = null;
		};
		timeoutRef.current = setTimeout(tick, nextDelay());
	}, []);

	// First scroll-into-view types the initially open file
	useEffect(() => {
		const el = paneRef.current;
		if (!el || prefersReducedMotion()) {
			armedRef.current = true;
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting || armedRef.current) return;
				armedRef.current = true;
				type(totalRef.current, preLenRef.current);
				io.disconnect();
			},
			{ rootMargin: "0px 0px -10% 0px" }
		);
		io.observe(el);
		return () => io.disconnect();
	}, [type]);

	// Every file switch after that types the new file
	useEffect(() => {
		if (!file || prevIdRef.current === file.id) return;
		prevIdRef.current = file.id;
		if (armedRef.current && !prefersReducedMotion()) type(total, preLen);
		else setShown(total);
	}, [file, total, preLen, type]);

	useEffect(
		() => () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		},
		[]
	);

	// Keep the caret in view while a long quote is still typing
	useEffect(() => {
		const el = scrollRef.current;
		if (el && shown < total) el.scrollTop = el.scrollHeight;
	}, [shown, total]);

	if (!file) {
		return (
			<div className="h-[380px] lg:h-auto lg:flex-1 lg:min-h-0 flex items-center justify-center bg-gray-950/60">
				<div className="text-center text-gray-600 font-mono text-sm px-6">
					<p className="text-4xl mb-3 opacity-40" aria-hidden="true">
						⌘P
					</p>
					<p>Show all files — or pick one in the Explorer</p>
				</div>
			</div>
		);
	}

	const typing = shown < total;
	const color = folderColor(file.folder);

	// Rendered lines: everything typed so far, plus the line mid-type
	let consumed = 0;
	const rendered: {
		line: ILineModel;
		visible: number;
		hasCaret: boolean;
	}[] = [];
	for (const line of lines) {
		if (consumed >= shown) break;
		const len = lineLen(line);
		const visible = Math.min(shown - consumed, len);
		consumed += len;
		rendered.push({
			line,
			visible,
			hasCaret: typing && consumed >= shown,
		});
	}

	return (
		<div
			ref={paneRef}
			className="relative h-[380px] lg:h-auto lg:flex-1 lg:min-h-0 flex flex-col bg-gray-950/60"
		>
			{/* Reviewer portrait — floats in the empty top-right of the pane
			    instead of squeezing next to the author value */}
			<div className="absolute top-10 right-4 md:top-12 md:right-8 z-10 pointer-events-none">
				<Image
					src={file.avatar}
					alt={file.displayName}
					width={112}
					height={112}
					className="w-16 h-16 md:w-28 md:h-28 rounded-full object-cover border-4 border-[#9146FF]/40 shadow-lg shadow-[#9146FF]/20"
					loading="lazy"
				/>
			</div>

			{/* Breadcrumbs */}
			<div className="flex items-center gap-1 px-4 pt-2 font-mono text-[11px] text-gray-500 select-none">
				recommendations
				<VscChevronRight aria-hidden="true" />
				<span className="flex items-center gap-1" style={{ color }}>
					<VscFolderOpened aria-hidden="true" /> {file.folder}
				</span>
				{file.subfolder && (
					<>
						<VscChevronRight aria-hidden="true" />
						<span className="text-gray-400">{file.subfolder}</span>
					</>
				)}
				<VscChevronRight aria-hidden="true" />
				<span className="flex items-center gap-1 text-gray-300">
					<VscMarkdown style={{ color }} aria-hidden="true" /> {file.fileName}
				</span>
			</div>

			<div
				ref={scrollRef}
				className="sql-editor-metrics ide-scroll flex-1 min-h-0 overflow-y-auto"
			>
				{rendered.map(({ line, visible, hasCaret }, i) => (
					<div
						key={i}
						className={`flex ${line.highlight ? "bg-[#9146FF]/10" : ""}`}
					>
						<span className="w-8 shrink-0 pr-3 text-right text-gray-600 select-none">
							{i + 1}
						</span>
						{/* Frontmatter wraps early so it never runs under the portrait */}
						<span
							className={`flex-1 min-w-0 ${
								line.frontmatter ? "pr-24 md:pr-40" : ""
							}`}
						>
							{renderSegs(line.segs, visible)}
							{hasCaret && <Caret />}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default Editor;
