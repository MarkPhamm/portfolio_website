// Text effects. Kept out of utils/motion.ts on purpose: only the lazily
// loaded homepage sections import this, so SplitText + ScrambleText never
// land in the _app chunk (hero TBT stays where it was).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/dist/SplitText";
import { ScrambleTextPlugin } from "gsap/dist/ScrambleTextPlugin";
import { DUR, EASE, prefersReducedMotion } from "./motion";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
}

/**
 * Lines rise out of their own masks as the element scrolls in. SplitText
 * re-splits on resize / font swap (autoSplit) and keeps the tween's progress,
 * so a finished reveal never replays. Never use this on the hero H1 — a
 * masked line isn't painted, which would push LCP back.
 */
export const revealLines = (
	el: HTMLElement | null,
	opts: { trigger?: Element | null; start?: string; delay?: number } = {}
): (() => void) => {
	if (!el || prefersReducedMotion() || ScrollTrigger.isInViewport(el)) {
		return () => {};
	}
	const split = SplitText.create(el, {
		type: "lines",
		mask: "lines",
		tag: "span",
		linesClass: "split-line",
		autoSplit: true,
		onSplit: (self) =>
			gsap.from(self.lines, {
				yPercent: 110,
				duration: DUR.slow,
				ease: EASE.out,
				stagger: 0.06,
				delay: opts.delay ?? 0,
				scrollTrigger: {
					trigger: opts.trigger ?? el,
					start: opts.start ?? "top 90%",
					once: true,
				},
			}),
	});
	return () => split.revert();
};

/**
 * Mono labels decode in place when they scroll in. Same character count in
 * a monospace face, so no layout shift; the text is readable before and
 * after. Returns a cleanup.
 */
export const scrambleIn = (
	el: HTMLElement | null,
	opts: { trigger?: Element | null; start?: string; delay?: number } = {}
): (() => void) => {
	if (!el || prefersReducedMotion()) return () => {};
	const text = el.textContent ?? "";
	let tween: gsap.core.Tween | undefined;
	const st = ScrollTrigger.create({
		trigger: opts.trigger ?? el,
		start: opts.start ?? "top 90%",
		once: true,
		onEnter: () => {
			tween = gsap.to(el, {
				duration: 0.7,
				delay: opts.delay ?? 0,
				ease: "none",
				scrambleText: {
					text,
					chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/",
					revealDelay: 0.15,
					speed: 0.6,
				},
			});
		},
	});
	return () => {
		st.kill();
		tween?.kill();
		el.textContent = text;
	};
};
