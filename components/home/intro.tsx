import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getLenis } from "../../utils/scroll";
import { markPageReady } from "../../utils/page-ready";

const QUERY = "SELECT * FROM mark;";

/**
 * First-visit letterbox opening. The hero is visible from the first frame
 * through the slit between two cinema bars (so it stays the LCP element and
 * Speed Index barely moves); the bars carry a SQL slate, then retract while
 * the hero's own entrance plays. Once per session, never under reduced
 * motion — the inline script in _document decides before first paint, and
 * this component only runs when it said "play". Any input fast-forwards.
 */
const Intro = () => {
	const topRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const queryRef = useRef<HTMLSpanElement>(null);
	const resultRef = useRef<HTMLSpanElement>(null);
	const barRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const html = document.documentElement;
		if (html.getAttribute("data-intro") !== "play") return;
		(window as Window & { __introJs?: boolean }).__introJs = true;
		try {
			sessionStorage.setItem("mp-intro", "1");
		} catch {
			/* private mode: it'll just play again next visit */
		}
		getLenis()?.stop();

		let finished = false;
		const finish = () => {
			if (finished) return;
			finished = true;
			html.setAttribute("data-intro", "done");
			getLenis()?.start();
		};

		const typed = { n: 0 };
		const tl = gsap
			.timeline({ onComplete: finish })
			.to(
				typed,
				{
					n: QUERY.length,
					duration: 0.4,
					ease: "none",
					onUpdate: () => {
						if (queryRef.current) queryRef.current.textContent = QUERY.slice(0, Math.round(typed.n));
					},
				},
				0.08
			)
			.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, 0.3)
			.fromTo(resultRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.5)
			.call(() => markPageReady("intro"), [], 0.62)
			.to(topRef.current, { yPercent: -100, duration: 0.6, ease: "power3.inOut" }, 0.62)
			.to(bottomRef.current, { yPercent: 100, duration: 0.6, ease: "power3.inOut" }, 0.62);

		const skip = () => {
			if (tl.progress() < 1) tl.timeScale(6);
		};
		const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "wheel", "touchstart"];
		events.forEach((ev) => window.addEventListener(ev, skip, { passive: true }));

		return () => {
			events.forEach((ev) => window.removeEventListener(ev, skip));
			tl.kill();
			finish();
		};
	}, []);

	return (
		<div className="intro pointer-events-none fixed inset-0 z-300" aria-hidden="true">
			<div ref={topRef} className="absolute inset-x-0 top-0 flex h-[38%] items-end bg-black">
				<div className="section-container flex w-full items-center justify-between pb-6 font-mono text-[12px] tracking-[0.06em] text-ink-2">
					<span>
						<span className="text-accent-soft">›</span> <span ref={queryRef} />
						<span className="ide-caret ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-accent-soft/80" />
					</span>
					<span className="hidden text-ink-3 sm:inline">markpham_dw</span>
				</div>
			</div>
			<div ref={bottomRef} className="absolute inset-x-0 bottom-0 flex h-[38%] items-start bg-black">
				<div className="section-container flex w-full items-center justify-between gap-6 pt-6 font-mono text-[12px] tracking-[0.06em] text-ink-3">
					<span ref={resultRef} style={{ opacity: 0 }}>
						1 row returned · 0.42s
					</span>
					<span className="relative block h-px w-32 overflow-hidden bg-white/10 sm:w-48">
						<span ref={barRef} className="absolute inset-0 origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
					</span>
				</div>
			</div>
		</div>
	);
};

export default Intro;
