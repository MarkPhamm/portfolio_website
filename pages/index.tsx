import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import HeroSection from "@/components/home/hero";
import QuoteSection2 from "@/components/home/quote2";
import SkillsSection from "@/components/home/skills";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";
import WaveDivider from "@/components/common/wave-divider";

// Below-the-fold sections — SSR for SEO, but the client JS chunks load lazily so
// they don't compete with hero hydration on the main thread.
const PipelineSection = dynamic(() => import("@/components/home/pipeline"));
const SqlTerminalSection = dynamic(() => import("@/components/home/sql-terminal"));
const CommentSection = dynamic(() => import("@/components/home/ide-testimonials"));
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

export const isSmallScreen = (): boolean => window.innerWidth < 767;
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

		// After hero paint, not during it — a 500ms refresh was landing in the
		// TBT window and re-measuring every section that had just hydrated.
		const refreshTimer = setTimeout(() => {
			const ric = (
				window as Window & {
					requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
				}
			).requestIdleCallback;
			if (typeof ric === "function") {
				ric(() => ScrollTrigger.refresh(), { timeout: 3000 });
			} else {
				ScrollTrigger.refresh();
			}
		}, 2000);

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
			<Layout>
				<Header />
				<ProgressIndicator />
				<main className="flex-col flex">
					{renderBackdrop()}
					<HeroSection />
					<PipelineSection />
					<QuoteSection2 />
					<SqlTerminalSection />
					<WaveDivider />
					<CommentSection />
					<SkillsSection isDesktop={isDesktop} />
					<ArticlesPreview />
					<WaveDivider flip />
					<ProjectsSection isDesktop={isDesktop} />
					<WaveDivider />
					<ActivitySection />
					<WaveDivider flip />
					<TimelineSection isDesktop={isDesktop} />
					<WaveDivider />
					<CertificateSection isDesktop={isDesktop} />
					<CollaborationSection />
					<Footer />
				</main>
				<Scripts />
			</Layout>
		</>
	);
}
