import "../styles/globals.scss";
import "../styles/article.css";

import type { AppProps } from "next/app";
import Script from "next/script";
import { useEffect } from "react";
import { IconContext } from "react-icons";
import { useRouter } from "next/router";
import { initClarity, trackPageView } from "../utils/clarity";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();

	useEffect(() => {
		initClarity();
	}, []);

	useEffect(() => {
		trackPageView(router.pathname);
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
			</IconContext.Provider>

			{/* GA4 — lazyOnload defers loading until after the main thread is idle, keeping it off the critical path */}
			<Script
				src="https://www.googletagmanager.com/gtag/js?id=G-FH792RMCK7"
				strategy="lazyOnload"
			/>
			<Script id="ga4-init" strategy="lazyOnload">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					window.gtag = gtag;
					gtag('js', new Date());
					gtag('config', 'G-FH792RMCK7', { send_page_view: false });
				`}
			</Script>
		</>
	);
}

export default MyApp;
