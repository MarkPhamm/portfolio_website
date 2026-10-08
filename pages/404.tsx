import React, { useEffect, useState } from "react";
import Link from "next/link";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";

export default function NotFound() {
	// The 404 is statically pre-rendered as /404 — the real path is only
	// knowable client-side. Never read router.asPath during render here
	// (hydration mismatch); echo it post-mount instead.
	const [path, setPath] = useState("…");

	useEffect(() => {
		setPath(window.location.pathname);
	}, []);

	return (
		<>
			<Layout title="404 — Page not found | Mark Pham">
				<Header />
				<div className="fixed top-0 left-0 h-screen w-screen bg-gray-900 -z-1"></div>
				<main className="section-container min-h-screen flex flex-col items-center justify-center text-center select-none py-24">
					<h1 className="type-hero title-silver w-fit mb-10">
						404
					</h1>
					<div className="panel w-full max-w-xl text-left font-mono text-sm md:text-base leading-relaxed px-5 py-4 md:px-7 md:py-5 mb-8 overflow-x-auto">
						<p>
							<span className="text-violet-soft">SELECT</span> *{" "}
							<span className="text-violet-soft">FROM</span> pages
						</p>
						<p>
							<span className="text-violet-soft">WHERE</span> path ={" "}
							<span className="text-[#34D399]">&apos;{path}&apos;</span>;
						</p>
						<p className="text-ink-3">-- 0 rows returned (took 4.04 ms)</p>
					</div>
					<p className="text-ink-2 text-lg mb-8">
						Looks like this JOIN came back empty.
					</p>
					<Link href="/">
						<a className="btn-pill btn-primary">
							Back to home
							<span className="btn-disc" aria-hidden="true">
								←
							</span>
						</a>
					</Link>
				</main>
				<Footer />
				<Scripts />
			</Layout>
		</>
	);
}
