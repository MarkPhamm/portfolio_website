// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import "../styles/globals.scss";
import "../styles/article.css";

import type { AppProps } from "next/app";
import Script from "next/script";
import { useEffect } from "react";
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
			<Component {...pageProps} />

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
