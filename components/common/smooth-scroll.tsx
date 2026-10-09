import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import type Lenis from "lenis";
import { prefersReducedMotion } from "../../utils/motion";
import { setLenis } from "../../utils/scroll";

type IdleWindow = Window & {
	requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
	cancelIdleCallback?: (id: number) => void;
};

/**
 * Lenis on GSAP's ticker, so Lenis and ScrollTrigger share one clock. User
 * scrolling is native; Lenis eases programmatic scrolls. The chunk is imported at idle — after hydration, outside the
 * hero's TBT window. If it fails (Safari 14.0 can't parse class fields) the
 * site keeps native scrolling. Never created under reduced motion.
 *
 * Also keeps ScrollTrigger honest when the page height changes after load
 * (SQL results, GitHub/Wakatime embeds, font swap).
 */
const SmoothScroll = (): null => {
	useEffect(() => {
		let refreshTimer: ReturnType<typeof setTimeout> | undefined;
		const ro = new ResizeObserver(() => {
			if (refreshTimer) clearTimeout(refreshTimer);
			refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
		});
		ro.observe(document.body);

		if (prefersReducedMotion()) {
			return () => {
				ro.disconnect();
				if (refreshTimer) clearTimeout(refreshTimer);
			};
		}

		let cancelled = false;
		let lenis: Lenis | null = null;
		const tick = (time: number) => lenis?.raf(time * 1000);

		const start = () => {
			import("lenis")
				.then(({ default: LenisCtor }) => {
					if (cancelled) return;
					// Wheel/trackpad scrolling stays native: interpolating it
					// (lerp) stacked on macOS momentum and felt sluggish. Lenis
					// still drives the eased programmatic jumps (anchors, curtain,
					// go-to-top) and the scroll lock, on GSAP's clock.
					lenis = new LenisCtor({
						smoothWheel: false,
						syncTouch: false,
						autoRaf: false,
					});
					lenis.on("scroll", ScrollTrigger.update);
					gsap.ticker.add(tick);
					gsap.ticker.lagSmoothing(0);
					setLenis(lenis);
					// The intro holds the page still until it hands over.
					if (document.documentElement.getAttribute("data-intro") === "play") {
						lenis.stop();
					}
				})
				.catch(() => {
					/* native scrolling it is */
				});
		};

		const w = window as IdleWindow;
		const idleId = w.requestIdleCallback
			? w.requestIdleCallback(start, { timeout: 1200 })
			: undefined;
		const fallbackTimer = idleId === undefined ? setTimeout(start, 300) : undefined;

		return () => {
			cancelled = true;
			if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
			if (fallbackTimer) clearTimeout(fallbackTimer);
			if (refreshTimer) clearTimeout(refreshTimer);
			ro.disconnect();
			gsap.ticker.remove(tick);
			lenis?.destroy();
			setLenis(null);
		};
	}, []);

	return null;
};

export default SmoothScroll;
