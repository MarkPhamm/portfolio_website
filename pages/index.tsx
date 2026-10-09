import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import HeroSection from "@/components/home/hero";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";
import Intro from "@/components/home/intro";
import SilkBackdrop from "@/components/home/silk-backdrop";

// Below-the-fold sections — SSR for SEO, but the client JS chunks load lazily so
// they don't compete with hero hydration on the main thread.
const PipelineSection = dynamic(() => import("@/components/home/pipeline"));
const QuoteSection2 = dynamic(() => import("@/components/home/quote2"));
const SkillsSection = dynamic(() => import("@/components/home/skills"));
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

	return (
		<>
			<Layout>
				<Intro />
				{/* The hero's light field, fixed behind every section. */}
				<SilkBackdrop />
				<Header />
				<ProgressIndicator />
				<main className="relative z-[1] flex flex-col">
					<HeroSection />
					<PipelineSection />
					<QuoteSection2 />
					<SqlTerminalSection />
					<CommentSection />
					<SkillsSection isDesktop={isDesktop} />
					<ArticlesPreview />
					<ProjectsSection isDesktop={isDesktop} />
					<ActivitySection />
					<TimelineSection isDesktop={isDesktop} />
					<CertificateSection isDesktop={isDesktop} />
					<CollaborationSection />
					<Footer />
				</main>
				<Scripts />
			</Layout>
		</>
	);
}
