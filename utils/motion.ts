// Shared motion system. `NO_MOTION_PREFERENCE_QUERY` historically lives as an
// export of pages/index.tsx — new code should import from here instead so
// motion utilities don't depend on a page module.
//
// Rule of thumb (VERSION.md v3.8.7): changes of context get authored motion;
// hovers stay at the deliberate 10ms snap. Every helper is a no-op under
// prefers-reduced-motion.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register once, client-side only.
if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
	gsap.config({ nullTargetWarn: false });
}

export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export const MQ = {
	motion: NO_MOTION_PREFERENCE_QUERY,
	reduce: "(prefers-reduced-motion: reduce)",
	desktop: "(min-width: 1024px)",
	fine: "(hover: hover) and (pointer: fine)",
} as const;

// power4.out ≈ cubic-bezier(.22,1,.36,1) — the "cine" curve in CSS
// (--ease-cine); power3.inOut ≈ (.76,0,.24,1) for things that travel.
export const EASE = {
	out: "power4.out",
	inOut: "power3.inOut",
	expo: "expo.out",
} as const;

// Kept short on purpose — the site should feel quick, not floaty.
export const DUR = {
	fast: 0.35,
	base: 0.6,
	slow: 0.8,
} as const;

export const prefersReducedMotion = (): boolean =>
	typeof window !== "undefined" &&
	!window.matchMedia(NO_MOTION_PREFERENCE_QUERY).matches;

const matches = (query: string): boolean =>
	typeof window !== "undefined" && window.matchMedia(query).matches;

/**
 * Batch reveal: elements rise and fade in as they scroll in (transform +
 * opacity only — compositor-friendly). Anything already on screen when this
 * runs is left alone, so content never blinks out (deep links,
 * back-navigation). Returns a cleanup.
 */
export const revealUp = (
	targets: gsap.DOMTarget,
	opts: { y?: number; stagger?: number; start?: string } = {}
): (() => void) => {
	if (prefersReducedMotion()) return () => {};
	const pending = gsap.utils
		.toArray<HTMLElement>(targets)
		.filter((el) => !ScrollTrigger.isInViewport(el));
	if (!pending.length) return () => {};

	gsap.set(pending, { opacity: 0, y: opts.y ?? 20 });
	const triggers = ScrollTrigger.batch(pending, {
		start: opts.start ?? "top 92%",
		once: true,
		onEnter: (batch) =>
			gsap.to(batch, {
				opacity: 1,
				y: 0,
				duration: DUR.base,
				ease: EASE.out,
				stagger: opts.stagger ?? 0.06,
				overwrite: true,
			}),
	});
	return () => triggers.forEach((t) => t.kill());
};

/**
 * Cinematic image reveal: the frame opens from an inset clip while the image
 * inside settles from 1.1x. Pass the frame's border radius so the clip
 * matches its corners. Returns a cleanup.
 */
export const clipReveal = (
	frame: HTMLElement | null,
	img?: HTMLElement | null,
	opts: { radius?: number; start?: string } = {}
): (() => void) => {
	if (!frame || prefersReducedMotion() || ScrollTrigger.isInViewport(frame)) {
		return () => {};
	}
	const r = opts.radius ?? 20;
	gsap.set(frame, { clipPath: `inset(10% 6% 10% 6% round ${r}px)` });
	if (img) gsap.set(img, { scale: 1.1 });
	const st = ScrollTrigger.create({
		trigger: frame,
		start: opts.start ?? "top 92%",
		once: true,
		onEnter: () => {
			gsap.to(frame, {
				clipPath: `inset(0% 0% 0% 0% round ${r}px)`,
				duration: DUR.slow,
				ease: EASE.out,
				clearProps: "clipPath",
			});
			if (img) gsap.to(img, { scale: 1, duration: 1, ease: EASE.out });
		},
	});
	return () => st.kill();
};

/**
 * Cinematic clip-path wipe for `.section-heading` elements. Kept for pages
 * that don't use <SectionHeader> yet. Returns the ScrollTrigger (or null).
 */
export const initHeadingWipe = (
	container: HTMLElement | null
): ScrollTrigger | null => {
	if (!container || prefersReducedMotion()) return null;
	const heading = container.querySelector<HTMLElement>(".section-heading");
	if (!heading) return null;

	gsap.set(heading, { clipPath: "inset(0 100% 0 0)" });
	return ScrollTrigger.create({
		trigger: heading,
		start: "top 85%",
		once: true,
		onEnter: () => {
			gsap.to(heading, {
				clipPath: "inset(0 0% 0 0)",
				duration: 0.8,
				ease: "power2.inOut",
			});
		},
	});
};

/**
 * Magnetic hover: the element leans toward the cursor and springs back on
 * leave. Desktop pointer devices only; no-op under reduced motion.
 * Returns a cleanup function.
 */
export const initMagneticHover = (
	el: HTMLElement | null,
	strength = 14
): (() => void) => {
	if (!el || prefersReducedMotion() || !matches(MQ.fine)) {
		return () => {};
	}

	// overwrite:"auto" retargets the in-flight tween each move; the elastic
	// spring-back can't be expressed with quickTo, so plain tweens it is.
	const onMove = (e: MouseEvent) => {
		const rect = el.getBoundingClientRect();
		const relX = e.clientX - (rect.left + rect.width / 2);
		const relY = e.clientY - (rect.top + rect.height / 2);
		const clamp = (v: number) => Math.max(-strength, Math.min(strength, v));
		gsap.to(el, {
			x: clamp((relX / rect.width) * strength * 2),
			y: clamp((relY / rect.height) * strength * 2),
			duration: 0.4,
			ease: "power3",
			overwrite: "auto",
		});
	};

	const onLeave = () => {
		gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
	};

	el.addEventListener("mousemove", onMove);
	el.addEventListener("mouseleave", onLeave);
	return () => {
		el.removeEventListener("mousemove", onMove);
		el.removeEventListener("mouseleave", onLeave);
		gsap.set(el, { x: 0, y: 0 });
	};
};
