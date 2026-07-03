import { METADATA, FAV_ARTICLES } from "../../constants";
import React, { useEffect, useState, useCallback, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import Cursor from "@/components/common/cursor";
import ReadsHero from "@/components/home/reads-hero";
import FavoriteReads from "@/components/home/favorite-reads";
import FavoriteArticles from "@/components/home/favorite-articles";
import CollaborationSection from "@/components/home/collaboration";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";

const DEBOUNCE_TIME = 100;

export const isSmallScreen = (): boolean => document.body.clientWidth < 767;
export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export interface IDesktop {
	isDesktop: boolean;
}

export default function Reads() {
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
			<Layout title={`Favorite Reads — ${METADATA.title}`} path="/aboutme/reads">
				<Header />
				<ProgressIndicator />
				<Cursor isDesktop={isDesktop} />
				<div className="flex-col flex">
					{renderBackdrop()}
					<ReadsHero />
					<FavoriteArticles items={FAV_ARTICLES} />
					<div className="section-divider my-4 md:my-6" />
					<FavoriteReads />
					<CollaborationSection />
					<Footer />
				</div>
				<Scripts />
			</Layout>
		</>
	);
}
