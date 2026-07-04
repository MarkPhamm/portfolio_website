import "../styles/globals.scss";
import "../styles/article.css";

import type { AppProps } from "next/app";
import Script from "next/script";
import { useEffect } from "react";
import { IconContext } from "react-icons";
import { useRouter } from "next/router";
import { initClarity, trackPageView } from "../utils/clarity";
import PageTransition from "../components/common/page-transition";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();

	useEffect(() => {
		initClarity();
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
				<PageTransition />
			</IconContext.Provider>

			{/* GA4 — afterInteractive (not lazyOnload): the init must run right after
			    hydration so window.gtag exists before the first (deferred) page_view
			    fires. Under lazyOnload the landing page_view was dropped — window.gtag
			    was still undefined — so utm_* on the entry URL never got recorded.
			    Page views are sent manually (send_page_view:false) to avoid double
			    counting; the initial one lands while the entry URL still holds utm_*. */}
			<Script
				src="https://www.googletagmanager.com/gtag/js?id=G-FH792RMCK7"
				strategy="afterInteractive"
			/>
			<Script id="ga4-init" strategy="afterInteractive">
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
