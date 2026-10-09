import { METADATA } from "../../constants";
import React, { useEffect, useCallback, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import CollaborationSection from "@/components/home/collaboration";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";
import StartupComponent from "./startup/StartupComponent";
import usePageAccent from "../../utils/use-page-accent";

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

	// Orange accent for the shell (menu, curtain, cursor label, scrollbar).
	usePageAccent("242 125 13", "255 154 60");

	return (
		<div className="theme-orange">
			<Layout title={`Start-up — ${METADATA.shortName}`} path="/aboutme/startup">
				<Header />
				<ProgressIndicator />
				<div className="flex-col flex">
					{renderBackdrop()}
					<StartupComponent />
					<CollaborationSection />
					<Footer />
				</div>
				<Scripts />
			</Layout>
		</div>
	);
}
