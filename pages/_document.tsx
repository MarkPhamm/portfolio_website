import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		return await Document.getInitialProps(ctx);
	}

	render() {
		return (
			<Html lang="en">
				<Head>
					<meta name="theme-color" content="#111827" />
					<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
					<link
						rel="preload"
						as="font"
						type="font/woff2"
						href="/fonts/GoogleSans-Medium.woff2"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						as="font"
						type="font/woff2"
						href="/fonts/GoogleSans-Bold.woff2"
						crossOrigin="anonymous"
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
