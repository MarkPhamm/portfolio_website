import { METADATA } from "../../constants";
import Head from "next/head";
import React, { useEffect, useCallback, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import CollaborationSection from "@/components/home/collaboration";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";
import MarketComponent from "./marketcamp/marketcomponent";
import UserStreakComponent from "./userstreak/userstreakcomponent";
import RetentionComponent from "./retention/retentioncomponent";
import TimeBetweenComponent from "./time/timebetweencomponent";
import { useRouter } from "next/router";

const DEBOUNCE_TIME = 100;

export const isSmallScreen = (): boolean => document.body.clientWidth < 767;
export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export default function Home() {
	gsap.registerPlugin(ScrollTrigger);
	gsap.config({ nullTargetWarn: false });

	const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const debouncedDimensionCalculator = useCallback(() => {
		if (resizeTimer.current) clearTimeout(resizeTimer.current);
		resizeTimer.current = setTimeout(() => {
			window.history.scrollRestoration = "manual";
		}, DEBOUNCE_TIME);
	}, []);

	useEffect(() => {
		debouncedDimensionCalculator();

		window.addEventListener("resize", debouncedDimensionCalculator);
		return () => {
			window.removeEventListener("resize", debouncedDimensionCalculator);
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
				<div className="flex-col flex">
					{renderBackdrop()}
					<RetentionComponent />
					<CollaborationSection />
					<Footer />
				</div>
				<Scripts />
			</Layout>
		</>
	);
}
