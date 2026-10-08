import { useEffect, useRef } from "react";

/**
 * 1px accent hairline across the top of the viewport. Written straight to
 * the element's transform once per frame — no React state per scroll event.
 * It's a readout, not decoration, so it runs under reduced motion too.
 */
const ProgressIndicator = () => {
	const barRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let raf = 0;
		const update = () => {
			raf = 0;
			const max = document.documentElement.scrollHeight - window.innerHeight;
			const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
			if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
		};
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<div className="progress pointer-events-none fixed inset-x-0 top-0 z-50" aria-hidden="true">
			<div ref={barRef} className="progress-bar" />
		</div>
	);
};

export default ProgressIndicator;
