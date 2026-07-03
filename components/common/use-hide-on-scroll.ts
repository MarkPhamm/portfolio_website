import { useEffect } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../../utils/motion";

// Don't react to scrolling until past this point — keeps the hook clear of the
// header's own GSAP entrance and avoids twitchiness at the very top.
const ACTIVATION_OFFSET = 120;
const DELTA_THRESHOLD = 6;

/**
 * Hides the element when scrolling down, reveals it when scrolling up.
 * Animates yPercent specifically: the header entrance tween animates `y` px
 * (and clears it with clearProps), so the two can never fight.
 */
const useHideOnScroll = (
	ref: React.RefObject<HTMLElement | null>,
	disabled = false
) => {
	useEffect(() => {
		if (prefersReducedMotion()) return;
		if (disabled) {
			// e.g. mobile menu open — the menu lives inside the header, so make
			// sure the header is on screen and stays there.
			if (ref.current) {
				gsap.to(ref.current, { yPercent: 0, duration: 0.2, overwrite: true });
			}
			return;
		}

		let lastY = Math.max(0, window.scrollY);

		const onScroll = () => {
			const el = ref.current;
			if (!el) return;
			// Clamp for iOS rubber-band overscroll.
			const y = Math.max(0, window.scrollY);
			if (y > lastY + DELTA_THRESHOLD && y > ACTIVATION_OFFSET) {
				gsap.to(el, { yPercent: -100, duration: 0.3, ease: "power3.out", overwrite: true });
			} else if (y < lastY - DELTA_THRESHOLD || y <= ACTIVATION_OFFSET) {
				gsap.to(el, { yPercent: 0, duration: 0.25, ease: "power3.out", overwrite: true });
			}
			lastY = y;
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [ref, disabled]);
};

export default useHideOnScroll;
