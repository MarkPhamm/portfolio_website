import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { VscChevronDown, VscChevronUp, VscSparkle } from "react-icons/vsc";
import { TESTIMONIAL_THEMES, ITestimonialTheme } from "../../../constants";
import { trackEvent } from "../../../utils/clarity";
import { prefersReducedMotion } from "../../../utils/motion";
import { FILES, FILE_BY_AUTHOR, ITestimonialFile } from "./files";

type Msg =
	| { role: "user"; text: string }
	| {
			role: "assistant";
			text: string;
			shown: number;
			done: boolean;
			authors?: string[];
	  };

// The 8 themes rephrased as the questions a visitor would actually ask.
const THEME_QUESTIONS: Record<string, string> = {
	"Mentorship & teaching": "What do people say about his mentorship?",
	"Owns pipelines end-to-end": "Can he own things end-to-end?",
	"Deep technical expertise": "How strong is he technically?",
	"Passion & fast learning": "Does he actually love this stuff?",
	"Team multiplier": "Is he a team player?",
	"Goes above & beyond": "Does he go beyond the job description?",
	"Speed & efficiency": "Is he fast?",
	"Docs & best practices": "Does he write documentation?",
};

const GREETING = `Ask me what ${FILES.length} colleagues say about Mark — pick a prompt below.`;

const Assistant = ({
	onOpenFile,
}: {
	onOpenFile: (file: ITestimonialFile, source: string) => void;
}) => {
	const [messages, setMessages] = useState<Msg[]>([
		{ role: "assistant", text: GREETING, shown: GREETING.length, done: true },
	]);
	const [asked, setAsked] = useState<Set<string>>(new Set());
	const [open, setOpen] = useState(true); // mobile collapse only
	const threadRef = useRef<HTMLDivElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Auto-scroll the thread as replies stream in
	useEffect(() => {
		const el = threadRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [messages]);

	useEffect(
		() => () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		},
		[]
	);

	const ask = (theme: ITestimonialTheme) => {
		trackEvent("testimonial_theme_click", { theme: theme.label });
		setAsked((prev) => new Set(prev).add(theme.label));

		// Only one stream at a time — finalize whatever is still typing
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		const reply = `${theme.blurb}. ${theme.authors.length} of ${FILES.length} reviewers bring this up:`;
		const instant = prefersReducedMotion();

		setMessages((prev) => [
			...prev.map((m) =>
				m.role === "assistant" && !m.done
					? { ...m, shown: m.text.length, done: true }
					: m
			),
			{ role: "user", text: THEME_QUESTIONS[theme.label] ?? theme.label },
			{
				role: "assistant",
				text: reply,
				shown: instant ? reply.length : 0,
				done: instant,
				authors: theme.authors,
			},
		]);

		if (instant) return;
		intervalRef.current = setInterval(() => {
			setMessages((prev) => {
				const last = prev[prev.length - 1];
				if (!last || last.role !== "assistant" || last.done) return prev;
				const shown = Math.min(last.shown + 3, last.text.length);
				const done = shown === last.text.length;
				if (done && intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
				return [...prev.slice(0, -1), { ...last, shown, done }];
			});
		}, 16);
	};

	return (
		<div className="flex flex-col bg-gray-900/40 min-w-0 lg:h-full">
			{/* Panel header — tap collapses on mobile only */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800/70 text-left lg:pointer-events-none"
			>
				<VscSparkle className="text-[#BF94FF]" aria-hidden="true" />
				<span className="font-mono text-xs font-semibold tracking-widest bg-gradient-to-r from-[#9146FF] to-[#BF94FF] bg-clip-text text-transparent">
					MARKBOT
				</span>
				<span className="hidden sm:inline font-mono text-[10px] text-gray-400">
					scripted · no tokens were harmed
				</span>
				<span className="ml-auto text-gray-500 lg:hidden" aria-hidden="true">
					{open ? <VscChevronDown /> : <VscChevronUp />}
				</span>
			</button>

			<div
				className={
					open
						? "flex flex-col min-h-0 lg:flex-1"
						: "hidden lg:flex lg:flex-col lg:min-h-0 lg:flex-1"
				}
			>
				{/* Thread */}
				<div
					ref={threadRef}
					className="ide-scroll overflow-y-auto px-3 py-3 space-y-3 max-h-[260px] lg:max-h-none lg:flex-1 lg:min-h-0"
					aria-live="polite"
				>
					{messages.map((msg, i) =>
						msg.role === "user" ? (
							<div key={i} className="flex justify-end">
								<p className="max-w-[85%] rounded-xl rounded-br-sm bg-gradient-to-br from-[#9146FF]/40 to-[#9146FF]/20 border border-[#9146FF]/40 px-3 py-2 text-xs text-gray-100">
									{msg.text}
								</p>
							</div>
						) : (
							<div key={i} className="flex flex-col items-start gap-2">
								<p className="max-w-[90%] rounded-xl rounded-bl-sm bg-gray-800/70 border border-gray-700/60 px-3 py-2 text-xs text-gray-200 leading-relaxed">
									{msg.text.slice(0, msg.shown)}
									{!msg.done && (
										<span
											className="ide-caret inline-block w-[7px] h-[13px] align-text-bottom bg-[#BF94FF] ml-0.5"
											aria-hidden="true"
										/>
									)}
								</p>
								{msg.done && msg.authors && (
									<div className="flex flex-wrap gap-1.5">
										{msg.authors.map((author) => {
											const file = FILE_BY_AUTHOR[author];
											if (!file) return null;
											return (
												<button
													key={author}
													type="button"
													onClick={() =>
														onOpenFile(file, "assistant_citation")
													}
													className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-gray-800/80 border border-gray-700/60 text-[11px] text-gray-300 hover:border-[#9146FF]/60 hover:text-white transition-all duration-[10ms]"
												>
													<Image
														src={file.avatar}
														alt={file.displayName}
														width={16}
														height={16}
														className="w-4 h-4 rounded-full object-cover"
														loading="lazy"
													/>
													{file.displayName.split(" ")[0]}
												</button>
											);
										})}
									</div>
								)}
							</div>
						)
					)}
				</div>

				{/* Prompt chips */}
				<div className="mt-auto px-3 py-3 border-t border-gray-800/70">
					<p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">
						Suggested prompts
					</p>
					<div className="flex flex-wrap gap-1.5">
						{TESTIMONIAL_THEMES.map((theme) => (
							<button
								key={theme.label}
								type="button"
								onClick={() => ask(theme)}
								className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-[10ms] ${
									asked.has(theme.label)
										? "bg-gray-800/40 border-gray-700/40 text-gray-500 hover:text-gray-300"
										: "bg-[#9146FF]/15 border-[#9146FF]/25 text-[#BF94FF] hover:bg-[#9146FF]/30 hover:border-[#9146FF]/50"
								}`}
							>
								{THEME_QUESTIONS[theme.label] ?? theme.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Assistant;
