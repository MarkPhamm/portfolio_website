// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { METADATA } from "../../constants";
import Head from "next/head";
import React, { useEffect, useState, useCallback, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header2";
import ProgressIndicator from "@/components/common/progress-indicator";
import Cursor from "@/components/common/cursor";
import CollaborationSection from "@/components/home/collaboration";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";
import StartupComponent from "./startup/StartupComponent";

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
		return () => {
			window.removeEventListener("resize", debouncedDimensionCalculator);
			if (resizeTimer.current) clearTimeout(resizeTimer.current);
		};
	}, [debouncedDimensionCalculator]);

	const renderBackdrop = (): React.ReactNode => (
		<div className="fixed top-0 left-0 h-screen w-screen bg-gray-900 -z-1"></div>
	);

	return (
		<div className="theme-orange">
			<Head>
				<title>{METADATA.title}</title>
				<style>{`
					::-webkit-scrollbar-thumb { background: #f27d0d !important; }
					::-webkit-scrollbar-thumb:hover { background: #ff9a3c !important; }
				`}</style>
			</Head>
			<Layout>
				<Header />
				<ProgressIndicator />
				<Cursor isDesktop={isDesktop} />
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
