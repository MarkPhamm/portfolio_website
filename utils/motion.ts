// Shared motion helpers. `NO_MOTION_PREFERENCE_QUERY` historically lives as an
// export of pages/index.tsx — new code should import from here instead so
// motion utilities don't depend on a page module.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export const prefersReducedMotion = (): boolean =>
	typeof window !== "undefined" &&
	!window.matchMedia(NO_MOTION_PREFERENCE_QUERY).matches;

/**
 * Cinematic clip-path wipe for `.section-heading` elements (the treatment
 * Skills/Articles/Timeline pioneered). Pass the section (or any ancestor)
 * element; returns the ScrollTrigger (or null) so callers can kill() it.
 */
export const initHeadingWipe = (
	container: HTMLElement | null
): ScrollTrigger | null => {
	if (!container) return null;
	const heading = container.querySelector<HTMLElement>(".section-heading");
	if (!heading || prefersReducedMotion()) return null;

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
	if (
		!el ||
		prefersReducedMotion() ||
		typeof window === "undefined" ||
		!window.matchMedia("(hover: hover) and (pointer: fine)").matches
	) {
		return () => {};
	}

	// gsap.quickTo needs GSAP >= 3.10 (repo ships 3.8); overwrite:"auto" gives
	// the same continuous-retarget behavior.
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
