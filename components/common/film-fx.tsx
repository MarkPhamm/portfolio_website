import React, { useEffect, useState } from "react";

/**
 * Film grain + soft vignette over the whole site. Mounted only after the
 * window `load` event so it can never compete with the hero paint. The grain
 * is a pre-rasterised noise tile jittered with stepped transforms
 * (compositor-only, no blend modes over scrolling content); static on touch
 * devices and under reduced motion (globals.scss).
 */
const FilmFx = () => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (document.readyState === "complete") {
			setMounted(true);
			return;
		}
		const onLoad = () => setMounted(true);
		window.addEventListener("load", onLoad, { once: true });
		return () => window.removeEventListener("load", onLoad);
	}, []);

	if (!mounted) return null;
	return (
		<>
			<div className="film-vignette" aria-hidden="true" />
			<div className="film-grain" aria-hidden="true" />
		</>
	);
};

export default FilmFx;
