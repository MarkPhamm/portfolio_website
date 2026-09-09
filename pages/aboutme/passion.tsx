import { METADATA } from "../../constants";
import Head from "next/head";
import React, { useEffect, useCallback, useRef } from "react";
import {
	RECIPE_LIST,
	flattenIngredients,
	isoDuration,
} from "../../utils/recipes";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import Layout from "@/components/common/layout";
import Header from "@/components/common/header";
import ProgressIndicator from "@/components/common/progress-indicator";
import CollaborationSection from "@/components/home/collaboration";
import Footer from "@/components/common/footer";
import Scripts from "@/components/common/scripts";
import PassionComponent from "./passion/PassionComponent";

const DEBOUNCE_TIME = 100;

// Each dish's collapsible recipe also ships as a schema.org Recipe so the
// panels are eligible for rich results instead of being invisible markup.
const RECIPE_JSON_LD = {
	"@context": "https://schema.org",
	"@graph": RECIPE_LIST.map((recipe) => ({
		"@type": "Recipe",
		name: recipe.name,
		image: `${METADATA.siteUrl}${recipe.image}`,
		author: { "@type": "Person", name: "Minh (Mark) Pham" },
		prepTime: isoDuration(recipe.prepMinutes),
		cookTime: isoDuration(recipe.cookMinutes),
		totalTime: isoDuration(recipe.prepMinutes + recipe.cookMinutes),
		recipeYield: `${recipe.serves} servings`,
		recipeIngredient: flattenIngredients(recipe),
		recipeInstructions: recipe.steps.map((step, index) => ({
			"@type": "HowToStep",
			position: index + 1,
			text: step,
		})),
	})),
};

export const isSmallScreen = (): boolean => document.body.clientWidth < 767;
export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export default function Home() {
	gsap.registerPlugin(ScrollTrigger);
	gsap.config({ nullTargetWarn: false });

	// Debounce timer lives in a ref so it persists across resize events.
	// The previous `let timer` inside the callback was always undefined on
	// each call, so clearTimeout was dead code and every resize leaked a
	// pending setTimeout.
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
		<div className="theme-orange">
			<Head>
				<style>{`
					::-webkit-scrollbar-thumb { background: #f27d0d !important; }
					::-webkit-scrollbar-thumb:hover { background: #ff9a3c !important; }
				`}</style>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(RECIPE_JSON_LD) }}
				/>
			</Head>
			<Layout title={`My Passion — ${METADATA.title}`} path="/aboutme/passion">
				<Header />
				<ProgressIndicator />
				<div className="flex-col flex">
					{renderBackdrop()}
					<main>
						<PassionComponent />
						<CollaborationSection />
					</main>
					<Footer />
				</div>
				<Scripts />
			</Layout>
		</div>
	);
}
