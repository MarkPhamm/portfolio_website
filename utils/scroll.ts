// One place for programmatic scrolling. Lenis owns the scroll position when
// it's running (components/common/smooth-scroll.tsx), so every jump goes
// through here; without Lenis (reduced motion, failed chunk) it falls back to
// native scrolling.
import type Lenis from "lenis";
import { prefersReducedMotion } from "./motion";

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null): void => {
	lenis = instance;
};

export const getLenis = (): Lenis | null => lenis;

// easeInOutQuart: long jumps accelerate, travel, then settle.
const travel = (t: number): number =>
	t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

export const resolveScrollY = (
	target: string | number | HTMLElement
): number | null => {
	if (typeof target === "number") return target;
	const el =
		typeof target === "string"
			? document.getElementById(target.replace(/^#/, ""))
			: target;
	if (!el) return null;
	// A pinned element reports its fixed-position rect; measure the spacer.
	const parent = el.parentElement;
	const box = parent && parent.classList.contains("pin-spacer") ? parent : el;
	return box.getBoundingClientRect().top + window.scrollY;
};

export const scrollToTarget = (
	target: string | number | HTMLElement,
	opts: { offset?: number; immediate?: boolean; duration?: number } = {}
): void => {
	const base = resolveScrollY(target);
	if (base === null) return;
	const y = Math.max(0, base + (opts.offset ?? 0));
	const immediate = !!opts.immediate || prefersReducedMotion();

	if (lenis) {
		lenis.scrollTo(y, {
			immediate,
			force: true,
			duration: opts.duration ?? 0.9,
			easing: travel,
		});
	} else {
		window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
	}
};

// Reference-counted so a modal opened from the menu can't unlock early.
let locks = 0;

export const lockScroll = (): void => {
	if (locks++ > 0) return;
	lenis?.stop();
	// body overflow never reaches the viewport here (html has overflow-x), so
	// lock the root element itself.
	document.documentElement.style.overflow = "hidden";
};

export const unlockScroll = (): void => {
	if (locks === 0 || --locks > 0) return;
	document.documentElement.style.overflow = "";
	lenis?.start();
};
