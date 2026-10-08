import React from "react";
import Link from "next/link";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";

export default function ServerError() {
	return (
		<>
			<Layout title="500 — Something broke | Mark Pham">
				<Header />
				<div className="fixed top-0 left-0 h-screen w-screen bg-gray-900 -z-1"></div>
				<main className="section-container min-h-screen flex flex-col items-center justify-center text-center select-none py-24">
					<h1 className="type-hero title-silver w-fit mb-10">
						500
					</h1>
					<div className="panel w-full max-w-xl text-left font-mono text-sm md:text-base leading-relaxed px-5 py-4 md:px-7 md:py-5 mb-8 overflow-x-auto">
						<p className="text-ink-3">-- ERROR: something broke upstream.</p>
						<p className="text-ink-3">-- Re-run the pipeline?</p>
					</div>
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
