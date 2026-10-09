import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../../utils/motion";
import { whenPageReady } from "../../utils/page-ready";

// Client-only: the light field is decoration, never part of the SSR paint.
const SilkCanvas = dynamic(() => import("./silk-canvas"), { ssr: false });

/**
 * The homepage backdrop: the hero's violet light field, fixed behind the
 * whole page so every section scrolls over the same light. The static
 * gradient paints first (and is the whole show without WebGL), the shader
 * fades in over it, and a scrim keeps the middle of the viewport calm for
 * text. It settles from 1.06 as the page appears (intro opening, curtain
 * lifting, or a direct landing); the starting scale is set in CSS
 * (`.silk-backdrop`) so the first paint already matches.
 */
const SilkBackdrop = () => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;
		let tween: gsap.core.Tween | null = null;
		const cancelReady = whenPageReady(() => {
			tween = gsap.fromTo(
				el,
				{ scale: 1.06 },
				{
					scale: 1,
					duration: 1.1,
					ease: "power3.out",
					// Settled: CSS drops the starting scale and its failsafe.
					onComplete: () => {
						el.classList.add("is-settled");
						gsap.set(el, { clearProps: "transform" });
					},
				}
			);
		});
		return () => {
			cancelReady();
			tween?.kill();
		};
	}, []);

	return (
		<div ref={ref} aria-hidden="true" className="silk-backdrop pointer-events-none fixed inset-0 z-0">
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(45% 55% at 80% 18%, rgb(145 70 255 / 0.28), transparent 70%), radial-gradient(40% 50% at 12% 88%, rgb(191 148 255 / 0.14), transparent 70%), radial-gradient(90% 90% at 50% 50%, rgb(14 8 30), rgb(8 7 11) 75%)",
				}}
			/>
			<SilkCanvas />
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(55% 40% at 50% 50%, rgb(6 5 7 / 0.35), transparent 75%), linear-gradient(to bottom, rgb(6 5 7 / 0.3), transparent 20%, transparent 72%, rgb(6 5 7 / 0.55))",
				}}
			/>
		</div>
	);
};

export default SilkBackdrop;
