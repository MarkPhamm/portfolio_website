import React, { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import {
	VscCheck,
	VscListTree,
	VscSourceControl,
} from "react-icons/vsc";
import { trackEvent } from "../../../utils/clarity";
import { revealUp } from "../../../utils/motion";
import { scrollToTarget } from "../../../utils/scroll";
import SectionHeader from "../../common/section-header";
import { FILES, ITestimonialFile } from "./files";
import Editor, { lineCount } from "./editor";
import Explorer from "./explorer";
import Tabs from "./tabs";
import QuickOpen from "./quick-open";
import Assistant from "./assistant";
import ThreadsMarquee from "./threads-marquee";

gsap.registerPlugin(ScrollTrigger);

const LINKEDIN_RECS_URL =
	"https://www.linkedin.com/in/minhbphamm/details/recommendations/";
const LAZARD_PDF_URL =
	"https://drive.google.com/file/d/1EyMtIZU1_ohN9i2lJ7sGvAiPnxX7vVAv/view?usp=sharing";

const IdeTestimonialsSection = () => {
	const sectionRef = useRef<HTMLElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	const [openTabs, setOpenTabs] = useState<string[]>([FILES[0].id]);
	const [activeId, setActiveId] = useState<string | null>(FILES[0].id);
	const [quickOpenVisible, setQuickOpenVisible] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [isMac, setIsMac] = useState(true);

	const fileById = (id: string | null) =>
		FILES.find((f) => f.id === id) ?? null;
	const activeFile = fileById(activeId);
	const tabFiles = openTabs
		.map((id) => fileById(id))
		.filter(Boolean) as ITestimonialFile[];

	// Single mutation shared by explorer, tabs, quick open, and MARKBOT citations
	const openFile = useCallback((file: ITestimonialFile, source: string) => {
		setOpenTabs((prev) =>
			prev.includes(file.id) ? prev : [...prev, file.id]
		);
		setActiveId(file.id);
		setDrawerOpen(false);
		trackEvent("ide_file_open", { author: file.displayName, source });
		// A citation tap on mobile lands with the editor off-screen — bring it back
		if (
			source === "assistant_citation" &&
			typeof window !== "undefined" &&
			window.innerWidth < 1024
		) {
			if (cardRef.current) scrollToTarget(cardRef.current, { offset: -80 });
		}
	}, []);

	const closeTab = (id: string) => {
		trackEvent("ide_tab_close");
		setOpenTabs((prev) => {
			const idx = prev.indexOf(id);
			const next = prev.filter((t) => t !== id);
			if (activeId === id) {
				// activate the right neighbor, else left, else empty state
				setActiveId(next[idx] ?? next[idx - 1] ?? null);
			}
			return next;
		});
	};

	const showQuickOpen = (via: "shortcut" | "button") => {
		trackEvent("ide_quick_open", { via });
		setQuickOpenVisible(true);
	};

	useEffect(() => {
		setIsMac(/Mac|iP(hone|ad|od)/.test(navigator.userAgent));
	}, []);

	// Real Cmd/Ctrl+P — hijacks Print only while the section is actually on
	// screen (part of the joke), never from elsewhere on the page.
	useEffect(() => {
		if (!sectionRef.current) return;
		let inView = false;
		const observer = new IntersectionObserver(
			([entry]) => (inView = entry.isIntersecting),
			{ threshold: 0.2 }
		);
		observer.observe(sectionRef.current);

		const onKey = (e: KeyboardEvent) => {
			if (!inView || !(e.metaKey || e.ctrlKey) || e.shiftKey) return;
			if (e.key.toLowerCase() !== "p") return;
			const target = e.target as HTMLElement | null;
			// don't steal the shortcut from a real input elsewhere on the page
			if (
				target &&
				(target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
				!target.closest(".ide-window")
			)
				return;
			e.preventDefault();
			showQuickOpen("shortcut");
		};
		window.addEventListener("keydown", onKey);
		return () => {
			observer.disconnect();
			window.removeEventListener("keydown", onKey);
		};
	}, []);

	// Entrance choreography (sql-terminal pattern): the window rises in.
	useEffect(() => revealUp(cardRef.current, { y: 40 }), []);

	return (
		<section
			ref={sectionRef}
			id="comments"
			className="w-full relative section-container py-24 md:py-36 flex flex-col"
		>
			<SectionHeader
				index="03"
				eyebrow="Testimonials"
				title="What Others Say"
				tagline={`${FILES.length} recommendations, one editor. Browse the files — or just ask the bot.`}
				className="mb-12 md:mb-16"
			/>

			<ThreadsMarquee
				activeAuthor={activeFile?.rawAuthor ?? null}
				onOpen={(file) => openFile(file, "theme_marquee")}
			/>

			<div
				ref={cardRef}
				className="ide-window relative rounded-[24px] overflow-hidden bg-surface-1 border border-line shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-colors duration-[10ms] hover:border-line-strong"
			>
				{/* Title bar */}
				<div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-surface-2/60">
					<div className="flex gap-1.5" aria-hidden="true">
						<span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]"></span>
						<span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]"></span>
						<span className="w-2.5 h-2.5 rounded-full bg-white/[0.15]"></span>
					</div>
					<span className="font-mono text-[11px] text-ink-3 truncate">
						recommendations — markpham
					</span>
					<div className="ml-auto flex items-center gap-2">
						<button
							type="button"
							onClick={() => setDrawerOpen(true)}
							className="lg:hidden flex items-center gap-1.5 font-mono text-[11px] text-violet-soft hover:text-ink-1 transition-colors duration-[10ms]"
							aria-label="Open file explorer"
						>
							<VscListTree aria-hidden="true" /> explorer
						</button>
						<button
							type="button"
							onClick={() => showQuickOpen("button")}
							className="font-mono text-[10px] text-ink-2 border border-line-strong rounded-md px-1.5 py-0.5 hover:text-ink-1 hover:border-white/30 transition-colors duration-[10ms]"
							aria-label="Quick open a recommendation file"
						>
							{isMac ? "⌘P" : "Ctrl+P"}
						</button>
					</div>
				</div>

				{/* Workbench — quick open + mobile drawer overlay this area */}
				<div className="relative">
					{/* Fixed workbench height — switching files scrolls inside the
					    panes instead of resizing the whole window */}
					<div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:h-[560px]">
						<aside className="hidden lg:block border-r border-line bg-surface-2/40 lg:min-h-0 lg:overflow-hidden">
							<Explorer
								activeId={activeId}
								onOpen={(file) => openFile(file, "explorer")}
							/>
						</aside>

						<div className="flex flex-col min-w-0 lg:min-h-0">
							<Tabs
								tabs={tabFiles}
								activeId={activeId}
								onSelect={setActiveId}
								onClose={closeTab}
							/>
							<Editor file={activeFile} />
						</div>

						<div className="border-t lg:border-t-0 lg:border-l border-line bg-surface-2/40 lg:min-h-0 lg:overflow-hidden">
							<Assistant onOpenFile={openFile} />
						</div>
					</div>

					{quickOpenVisible && (
						<QuickOpen
							onOpen={(file) => openFile(file, "quick_open")}
							onClose={() => setQuickOpenVisible(false)}
						/>
					)}

					{/* Mobile explorer drawer */}
					{drawerOpen && (
						<>
							<div
								className="absolute inset-0 z-20 bg-canvas/70 lg:hidden"
								onClick={() => setDrawerOpen(false)}
								aria-hidden="true"
							/>
							<div className="absolute inset-y-0 left-0 z-30 w-60 bg-surface-1 border-r border-line lg:hidden overflow-y-auto">
								<Explorer
									activeId={activeId}
									onOpen={(file) => openFile(file, "explorer")}
								/>
							</div>
						</>
					)}
				</div>

				{/* Status bar — colored segments, VS Code-theme style */}
				<div className="flex items-center border-t border-line bg-gray-950/80 font-mono text-[11px] text-ink-2 overflow-hidden">
					<button
						type="button"
						onClick={() => {
							trackEvent("recommendations_click", {
								source: "status_bar_branch",
							});
							window.open(LINKEDIN_RECS_URL, "_blank", "noopener,noreferrer");
						}}
						className="flex items-center gap-1.5 px-3 py-1.5 bg-violet/80 text-white hover:bg-violet transition-colors duration-[10ms]"
						title="View all recommendations on LinkedIn"
					>
						<VscSourceControl aria-hidden="true" /> main*
					</button>
					<span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300">
						<VscCheck aria-hidden="true" />
						{FILES.length} recommendations
					</span>
					<span className="ml-auto hidden sm:flex items-center py-1.5">
						{activeFile && (
							<span className="px-3 text-violet-soft">
								Ln {lineCount(activeFile)}, Col 42
							</span>
						)}
						<span className="px-3 text-sky-300">Markdown</span>
						<span className="px-3 text-amber-300">UTF-8</span>
					</span>
				</div>
			</div>

			<div className="mt-8 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
				<a
					href={LINKEDIN_RECS_URL}
					className="text-ink-3 hover:text-ink-1 transition-colors duration-[10ms]"
					target="_blank"
					rel="noreferrer"
					onClick={() =>
						trackEvent("recommendations_click", { source: "linkedin" })
					}
				>
					View all on LinkedIn <span className="text-accent-soft">↗</span>
				</a>
				<span className="text-ink-3" aria-hidden="true">
					·
				</span>
				<a
					href={LAZARD_PDF_URL}
					className="text-ink-3 hover:text-ink-1 transition-colors duration-[10ms]"
					target="_blank"
					rel="noreferrer"
					onClick={() =>
						trackEvent("recommendations_click", { source: "lazard_pdf" })
					}
				>
					Lazard reference letter (PDF) <span className="text-accent-soft">↗</span>
				</a>
			</div>
		</section>
	);
};

export default IdeTestimonialsSection;
