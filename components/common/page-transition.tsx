import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { prefersReducedMotion } from "../../utils/motion";

/**
 * Brand-purple curtain wipe on client-side route changes. Covers the viewport
 * while the next page mounts (also hiding the scroll-to-top jump that
 * `scrollRestoration = "manual"` exposes), then sweeps away. Disabled under
 * prefers-reduced-motion — a hard cut is the correct reduced-motion behavior.
 */
const PageTransition = () => {
	const router = useRouter();
	const curtainRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (prefersReducedMotion()) return;
		const curtain = curtainRef.current;
		if (!curtain) return;

		let covering = false;
		let coverTween: ReturnType<typeof gsap.to> | null = null;
		let safetyTimer: ReturnType<typeof setTimeout> | null = null;

		gsap.set(curtain, { yPercent: -100, visibility: "visible" });

		const coverOut = () => {
			gsap.to(curtain, {
				yPercent: 100,
				duration: 0.4,
				ease: "power3.out",
				overwrite: true,
				onComplete: () => {
					covering = false;
					curtain.style.pointerEvents = "none";
					gsap.set(curtain, { yPercent: -100 });
					// Belt-and-suspenders on top of per-section unmount cleanup.
					ScrollTrigger.refresh();
				},
			});
		};

		const handleStart = (url: string) => {
			// Hash moves on the current page emit hashChangeStart, not this —
			// but guard anyway so a same-path push never flashes the curtain.
			if (url.split("#")[0] === window.location.pathname) return;
			covering = true;
			curtain.style.pointerEvents = "auto";
			coverTween = gsap.to(curtain, {
				yPercent: 0,
				duration: 0.28,
				ease: "power2.in",
				overwrite: true,
			});
			if (safetyTimer) clearTimeout(safetyTimer);
			// Never leave the site covered if complete/error never fires.
			safetyTimer = setTimeout(() => {
				if (covering) coverOut();
			}, 4000);
		};

		const handleDone = () => {
			if (!covering) return;
			if (safetyTimer) {
				clearTimeout(safetyTimer);
				safetyTimer = null;
			}
			// One frame so the new page paints beneath the curtain first.
			const proceed = () => {
				requestAnimationFrame(coverOut);
			};
			if (coverTween && coverTween.isActive()) {
				coverTween.eventCallback("onComplete", proceed);
			} else {
				proceed();
			}
		};

		router.events.on("routeChangeStart", handleStart);
		router.events.on("routeChangeComplete", handleDone);
		router.events.on("routeChangeError", handleDone);

		return () => {
			router.events.off("routeChangeStart", handleStart);
			router.events.off("routeChangeComplete", handleDone);
			router.events.off("routeChangeError", handleDone);
			if (safetyTimer) clearTimeout(safetyTimer);
			gsap.killTweensOf(curtain);
		};
		// router.events is a stable emitter; window.location avoids stale closures.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			ref={curtainRef}
			aria-hidden="true"
			className="fixed inset-0 z-[200] bg-gray-900 pointer-events-none"
			style={{ visibility: "hidden" }}
		>
			<div
				className="absolute bottom-0 left-0 right-0 h-[3px]"
				style={{ background: "linear-gradient(90deg, #9146FF 0%, #BF94FF 100%)" }}
			/>
		</div>
	);
};

export default PageTransition;
