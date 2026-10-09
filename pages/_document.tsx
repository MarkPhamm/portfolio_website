import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		return await Document.getInitialProps(ctx);
	}

	render() {
		return (
			<Html lang="en">
				<Head>
					<meta name="theme-color" content="#060507" />
					<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
					{/* One variable file covers every weight the hero uses. */}
					<link
						rel="preload"
						as="font"
						type="font/woff2"
						href="/fonts/Geist-latin.woff2"
						crossOrigin="anonymous"
					/>
					{/* First-visit letterbox intro: decide before first paint so the
					    SSR'd overlay never flashes. Only "/", no deep-link hash,
					    once per session, and never under reduced motion. If the
					    intro's JS hasn't claimed it within 4s, stand down. */}
					<script
						dangerouslySetInnerHTML={{
							__html:
								"(function(){try{var d=document.documentElement,p=location.pathname==='/'&&!location.hash&&!sessionStorage.getItem('mp-intro')&&matchMedia('(prefers-reduced-motion: no-preference)').matches;d.setAttribute('data-intro',p?'play':'skip');if(p)setTimeout(function(){if(d.getAttribute('data-intro')==='play'&&!window.__introJs)d.setAttribute('data-intro','skip')},4000)}catch(e){}})();",
						}}
					/>
					<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
					<link rel="dns-prefetch" href="https://scripts.clarity.ms" />
					<link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
					<link rel="dns-prefetch" href="https://api.github.com" />
					<link rel="dns-prefetch" href="https://api.ipify.org" />
					<link rel="dns-prefetch" href="https://firestore.googleapis.com" />
					<script
						dangerouslySetInnerHTML={{
							__html:
								"window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','G-FH792RMCK7',{send_page_view:false});",
						}}
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
