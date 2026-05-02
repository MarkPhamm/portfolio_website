import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		return await Document.getInitialProps(ctx);
	}

	render() {
		return (
			<Html lang="en">
				<Head>
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
					<link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
					<link rel="preconnect" href="https://scripts.clarity.ms" crossOrigin="anonymous" />
					<link rel="preconnect" href="https://static.cloudflareinsights.com" crossOrigin="anonymous" />
					<link rel="dns-prefetch" href="https://api.ipify.org" />
					<link rel="dns-prefetch" href="https://firestore.googleapis.com" />
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
