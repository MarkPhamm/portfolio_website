import "../styles/globals.scss";
import "../styles/article.css";

import type { AppProps } from "next/app";
import Script from "next/script";
import { useEffect } from "react";
import { IconContext } from "react-icons";
import { useRouter } from "next/router";
import { initClarity, trackPageView } from "../utils/clarity";
import { markPageReady } from "../utils/page-ready";
import TransitionController from "../components/common/transition-controller";
import SmoothScroll from "../components/common/smooth-scroll";
import FilmFx from "../components/common/film-fx";
import CursorLabel from "../components/common/cursor-label";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();

	useEffect(() => {
		initClarity();
		// Direct landing: unless the first-visit intro is about to play (it
		// signals readiness itself), the page is on screen now.
		if (document.documentElement.getAttribute("data-intro") !== "play") {
			markPageReady("direct");
		}
	}, []);

	useEffect(() => {
		// asPath (not pathname) keeps the query string, so the landing page_view's
		// page_path is accurate; utm_* attribution rides in page_location either way.
		trackPageView(router.asPath);
		const handleRouteChange = (url: string) => {
			trackPageView(url);
		};
		router.events.on("routeChangeComplete", handleRouteChange);
		return () => {
			router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, [router]);

	return (
		<>
			{/* react-icons are decorative (always paired with text or an aria-label),
			    so mark every icon aria-hidden + focusable=false to clear the
			    svg-img-alt a11y audit without per-icon props. */}
			<IconContext.Provider value={{ attr: { "aria-hidden": "true", focusable: "false" } }}>
				<Component {...pageProps} />
				<TransitionController />
				<SmoothScroll />
				<FilmFx />
				<CursorLabel />
			</IconContext.Provider>

			{/* Stub lives in _document so page_view can queue (utm_* still on
			    the URL). The 160KB gtag.js payload waits until after load. */}
			<Script
				src="https://www.googletagmanager.com/gtag/js?id=G-FH792RMCK7"
				strategy="lazyOnload"
			/>
		</>
	);
}

export default MyApp;
