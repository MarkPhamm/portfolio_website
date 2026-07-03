import Head from "next/head";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import Cursor from "@/components/common/cursor";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";

export default function ServerError() {
	const [isDesktop, setIsDesktop] = useState(true);

	useEffect(() => {
		setIsDesktop(
			typeof window.orientation === "undefined" &&
				navigator.userAgent.indexOf("IEMobile") === -1
		);
	}, []);

	return (
		<>
			<Head>
				<title>500 — Something broke | Mark Pham</title>
			</Head>
			<Layout>
				<Header />
				<Cursor isDesktop={isDesktop} />
				<div className="fixed top-0 left-0 h-screen w-screen bg-gray-900 -z-1"></div>
				<main className="section-container min-h-screen flex flex-col items-center justify-center text-center select-none py-24">
					<h1 className="text-7xl md:text-9xl font-bold text-gradient w-fit mb-8">
						500
					</h1>
					<div className="w-full max-w-xl rounded-xl border border-gray-700/60 bg-[#282a36] text-left font-mono text-sm md:text-base leading-relaxed px-5 py-4 md:px-7 md:py-5 mb-8 overflow-x-auto">
						<p className="text-gray-400">-- ERROR: something broke upstream.</p>
						<p className="text-gray-400">-- Re-run the pipeline?</p>
					</div>
					<Link href="/">
						<a className="link inline-flex items-center gap-3 px-6 py-3 bg-[#9146FF] hover:bg-[#7B3FD9] text-white text-base font-medium rounded-full transition-all duration-[10ms] hover:shadow-lg hover:shadow-[#9146FF]/25 hover:-translate-y-0.5">
							← Back to home
						</a>
					</Link>
				</main>
				<Footer />
				<Scripts />
			</Layout>
		</>
	);
}
