import { useEffect } from "react";

/**
 * Re-points the site accent for one page (Passion / Start-up are orange) on
 * <html>, so the portaled menu, the route curtain, the cursor label, the
 * scrollbar and text selection follow it. Removed on unmount. Deliberately
 * not a <Head><style>: Next 12 never removes those on client navigation, so
 * the override (and the old scrollbar one) leaked onto the next page.
 * In-page content gets the same values at first paint from the .theme-orange
 * wrapper (styles/globals.scss).
 */
const usePageAccent = (accent: string, accentSoft: string): void => {
	useEffect(() => {
		const root = document.documentElement.style;
		root.setProperty("--accent", accent);
		root.setProperty("--accent-soft", accentSoft);
		return () => {
			root.removeProperty("--accent");
			root.removeProperty("--accent-soft");
		};
	}, [accent, accentSoft]);
};

export default usePageAccent;
