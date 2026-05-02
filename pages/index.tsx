// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { METADATA } from "../constants";
import Head from "next/head";
import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import Cursor from "@/components/common/cursor";
import HeroSection from "@/components/home/hero";
import QuoteSection2 from "@/components/home/quote2";
import SkillsSection from "@/components/home/skills";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";
import WaveDivider from "@/components/common/wave-divider";

// Below-the-fold sections — SSR for SEO, but the client JS chunks load lazily so
// they don't compete with hero hydration on the main thread.
const CommentSection = dynamic(() => import("@/components/home/comment"));
const ArticlesPreview = dynamic(() => import("@/components/home/articles-preview"));
const ProjectsSection = dynamic(() => import("@/components/home/projects"));
const ActivitySection = dynamic(() => import("@/components/home/activity"));
const TimelineSection = dynamic(() => import("@/components/home/timeline"));
const CertificateSection = dynamic(() => import("@/components/home/certificate"));
const CollaborationSection = dynamic(() => import("@/components/home/collaboration"));

// Register GSAP plugins once at module scope, not on every render.
if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
	gsap.config({ nullTargetWarn: false });
}

const DEBOUNCE_TIME = 100;

export const isSmallScreen = (): boolean => document.body.clientWidth < 767;
export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export interface IDesktop {
	isDesktop: boolean;
}

export default function Home() {
	const [isDesktop, setisDesktop] = useState(true);

	const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const debouncedDimensionCalculator = useCallback(() => {
		if (resizeTimer.current) clearTimeout(resizeTimer.current);
		resizeTimer.current = setTimeout(() => {
			const isDesktopResult =
				typeof window.orientation === "undefined" &&
				navigator.userAgent.indexOf("IEMobile") === -1;

			window.history.scrollRestoration = "manual";

			setisDesktop(isDesktopResult);
		}, DEBOUNCE_TIME);
	}, []);

	useEffect(() => {
		debouncedDimensionCalculator();

		window.addEventListener("resize", debouncedDimensionCalculator);

		// Refresh ScrollTrigger after initial load to prevent first-visit bugs
		const refreshTimer = setTimeout(() => {
			ScrollTrigger.refresh();
		}, 500);

		return () => {
			window.removeEventListener("resize", debouncedDimensionCalculator);
			clearTimeout(refreshTimer);
			if (resizeTimer.current) clearTimeout(resizeTimer.current);
		};
	}, [debouncedDimensionCalculator]);

	const renderBackdrop = (): React.ReactNode => (
		<div className="fixed top-0 left-0 h-screen w-screen bg-gray-900 -z-1"></div>
	);

	return (
		<>
			<Head>
				<title>{METADATA.title}</title>
			</Head>
			<Layout>
				<Header />
				<ProgressIndicator />
				<Cursor isDesktop={isDesktop} />
				<main className="flex-col flex">
					{renderBackdrop()}
					<HeroSection />
					<QuoteSection2 />
					<WaveDivider />
					<CommentSection isDesktop={isDesktop} />
					<SkillsSection isDesktop={isDesktop} />
					<ArticlesPreview />
					<WaveDivider flip />
					<ProjectsSection isDesktop={isDesktop} />
					<WaveDivider />
					<ActivitySection />
					<WaveDivider flip />
					<TimelineSection isDesktop={isDesktop} />
					{/* <AboutSection /> */}
					<WaveDivider flip />
					<CertificateSection isDesktop={isDesktop} />
					<CollaborationSection />
					<Footer />
				</main>
				<Scripts />
			</Layout>
		</>
	);
}
