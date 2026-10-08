import React, { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import type Typed from "typed.js";
import { QUOTE_STRINGS } from "../../constants";
import { prefersReducedMotion, revealUp } from "../../utils/motion";

type Segment = { text: string; highlight: boolean };

// QUOTE_STRINGS carry their highlights as inline <span style="color:…">.
// Parse them at render time (server-safe, no innerHTML) into plain segments.
const parseQuote = (html: string): Segment[] => {
	const out: Segment[] = [];
	const re = /<span[^>]*>(.*?)<\/span>/g;
	let last = 0;
	let match: RegExpExecArray | null;
	while ((match = re.exec(html))) {
		if (match.index > last) out.push({ text: html.slice(last, match.index), highlight: false });
		out.push({ text: match[1], highlight: true });
		last = re.lastIndex;
	}
	if (last < html.length) out.push({ text: html.slice(last), highlight: false });
	return out;
};

const LINES = QUOTE_STRINGS.map(parseQuote);

// What typed.js types: the same strings, highlights restyled as `.mf-hi`.
const TYPED_LINES = QUOTE_STRINGS.map((html) =>
	html.replace(/<span[^>]*>(.*?)<\/span>/g, '<span class="mf-hi">$1</span>')
);

const LINE_CLASS =
	"col-start-1 row-start-1 text-[clamp(2rem,5.2vw,4.75rem)] font-light leading-[1.08] tracking-[-0.035em] text-ink-1";

const renderSegments = (segments: Segment[]) =>
	segments.map((seg, i) =>
		seg.highlight ? (
			<span key={i} className="mf-hi">
				{seg.text}
			</span>
		) : (
			<React.Fragment key={i}>{seg.text}</React.Fragment>
		)
	);

/**
 * The manifesto, typed the way it always was: one line at a time — type,
 * hold 4s, backspace, next — looping (typed.js, same speeds as before), now
 * in display type. Every line also sits invisibly in the same grid cell, so
 * the box is always as tall as the longest line at this width and typing
 * never shifts the page. Screen readers get all four lines as a list.
 * Reduced motion: the first line, static.
 */
const QuoteSection2 = () => {
	const sectionRef = useRef<HTMLElement>(null);
	const typedRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const section = sectionRef.current;
		const target = typedRef.current;
		if (!section || !target) return;
		if (prefersReducedMotion()) {
			target.innerHTML = TYPED_LINES[0];
			return;
		}

		let typed: Typed | null = null;
		let cancelled = false;
		const trigger = ScrollTrigger.create({
			trigger: section,
			start: "top 80%",
			once: true,
			onEnter: () => {
				import("typed.js").then(({ default: TypedCtor }) => {
					if (cancelled) return;
					typed = new TypedCtor(target, {
						strings: TYPED_LINES,
						typeSpeed: 40,
						backSpeed: 25,
						backDelay: 4000,
						contentType: "html",
						loop: true,
					});
				});
			},
		});
		const cleanupTail = revealUp(section.querySelectorAll(".mf-tail"), { start: "top 95%" });

		return () => {
			cancelled = true;
			trigger.kill();
			typed?.destroy();
			cleanupTail();
		};
	}, []);

	return (
		<section ref={sectionRef} className="relative w-full select-none overflow-hidden">
			<div className="section-container relative py-28 md:py-44">
				{/* Oversized outline quote mark */}
				<span
					aria-hidden="true"
					className="pointer-events-none absolute -top-4 left-2 select-none text-[9rem] font-light leading-none md:left-10 md:text-[15rem]"
					style={{ color: "transparent", WebkitTextStroke: "1px rgb(var(--accent) / 0.28)" }}
				>
					&ldquo;
				</span>

				<div className="relative mx-auto grid max-w-6xl text-center" aria-hidden="true">
					{LINES.map((segments, i) => (
						<p key={i} className={`invisible ${LINE_CLASS}`}>
							{renderSegments(segments)}
							<span className="typed-cursor">|</span>
						</p>
					))}
					<p className={LINE_CLASS}>
						<span ref={typedRef} />
					</p>
				</div>
				<ul className="sr-only">
					{LINES.map((segments, i) => (
						<li key={i}>{segments.map((seg) => seg.text).join("")}</li>
					))}
				</ul>

				<div className="mf-tail mt-16 flex flex-col items-center gap-6 md:mt-24">
					<p className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-3">
						scroll down and <span className="text-ink-1">see for yourself</span>
					</p>
					<svg
						aria-hidden="true"
						className="chevron-bounce h-5 w-5 text-accent-soft"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>
		</section>
	);
};

export default QuoteSection2;
