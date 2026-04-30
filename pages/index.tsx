// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { METADATA } from "../constants";
import Head from "next/head";
import React, { useEffect, useState, useCallback, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import Cursor from "@/components/common/cursor";
import HeroSection from "@/components/home/hero";
import ProjectsSection from "@/components/home/projects";
import QuoteSection from "@/components/home/quote";
import QuoteSection2 from "@/components/home/quote2";
import SkillsSection from "@/components/home/skills";
import CollaborationSection from "@/components/home/collaboration";
import Footer from "@/components/common/footer";
import TimelineSection from "@/components/home/timeline";
import Scripts from "@/components/common/scripts";
import AboutSection from "@/components/home/about";
import CommentSection from "@/components/home/comment";
import CertificateSection from "@/components/home/certificate";
import ArticlesPreview from "@/components/home/articles-preview";
import ActivitySection from "@/components/home/activity";
import WaveDivider from "@/components/common/wave-divider";

const DEBOUNCE_TIME = 100;

export const isSmallScreen = (): boolean => document.body.clientWidth < 767;
export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export interface IDesktop {
	isDesktop: boolean;
}

export default function Home() {
	gsap.registerPlugin(ScrollTrigger);
	gsap.config({ nullTargetWarn: false });

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
