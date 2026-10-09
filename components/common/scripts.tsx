import { useEffect, useState } from "react";
import { scrollToTarget } from "../../utils/scroll";

/**
 * "Go to top" — a glass disc that appears once the hero is behind you.
 * (The file name is historical; pages import it as <Scripts />.)
 */
const Scripts: React.FC = () => {
	const [shown, setShown] = useState(false);

	useEffect(() => {
		let raf = 0;
		const update = () => {
			raf = 0;
			setShown(window.scrollY > window.innerHeight * 0.9);
		};
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", schedule, { passive: true });
		return () => {
			window.removeEventListener("scroll", schedule);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<button
			type="button"
			aria-label="Go to top"
			onClick={() => scrollToTarget(0)}
			tabIndex={shown ? 0 : -1}
			className={`glass fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full text-ink-1 transition-opacity duration-[10ms] hover:border-white/[0.28] ${
				shown ? "opacity-100" : "pointer-events-none opacity-0"
			}`}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		</button>
	);
};

Scripts.displayName = "Scripts";

export default Scripts;
