// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { gsap, Linear } from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { isSmallScreen, NO_MOTION_PREFERENCE_QUERY } from "pages";
import { trackEvent } from "../../utils/clarity";

const COLLABORATION_STYLE = {
	SLIDING_TEXT: "text-[#9146FF] opacity-[0.15] motion-reduce:opacity-[0.25] text-3xl sm:text-5xl md:text-7xl font-bold whitespace-nowrap",
	SECTION:
		"w-full relative select-none py-12 sm:py-18 md:py-24 tall:py-18 section-container flex flex-col",
	TITLE: "mt-6 md:mt-8 font-medium text-3xl sm:text-4xl md:text-5xl text-center",
};

const CollaborationSection = () => {
	const quoteRef = useRef<HTMLDivElement>(null);
	const targetSection = useRef<HTMLDivElement>(null);

	const [willChange, setwillChange] = useState(false);

	const initTextGradientAnimation = (
		targetSection: React.RefObject<HTMLDivElement | null>
	): ScrollTrigger => {
		if (!quoteRef.current || !targetSection.current) return ScrollTrigger.create({});
		const timeline = gsap.timeline({ defaults: { ease: Linear.easeNone } });
		timeline
			.from(quoteRef.current, { opacity: 0, duration: 2 })
			.to(quoteRef.current.querySelector(".text-strong"), {
				backgroundPositionX: "100%",
				duration: 1,
			});

		return ScrollTrigger.create({
			trigger: targetSection.current,
			start: "center bottom",
			end: "center center",
			scrub: 0,
			animation: timeline,
			onToggle: (self) => setwillChange(self.isActive),
		});
	};

	const initSlidingTextAnimation = (
		targetSection: React.RefObject<HTMLDivElement | null>
	) => {
		if (!targetSection.current) return ScrollTrigger.create({});
		const slidingTl = gsap.timeline({ defaults: { ease: Linear.easeNone } });

		slidingTl
			.to(targetSection.current.querySelector(".ui-left"), {
				xPercent: isSmallScreen() ? -500 : -150,
			})
			.from(
				targetSection.current.querySelector(".ui-right"),
				{ xPercent: isSmallScreen() ? -500 : -150 },
				"<"
			);

		return ScrollTrigger.create({
			trigger: targetSection.current,
			start: "top bottom",
			end: "bottom top",
			scrub: 0,
			animation: slidingTl,
		});
	};

	useEffect(() => {
		const textBgAnimation = initTextGradientAnimation(targetSection);
		let slidingAnimation: ScrollTrigger | undefined;

		const { matches } = window.matchMedia(NO_MOTION_PREFERENCE_QUERY);

		if (matches) {
			slidingAnimation = initSlidingTextAnimation(targetSection);
		}

		return () => {
			textBgAnimation.kill();
			slidingAnimation?.kill();
		};
	}, [quoteRef, targetSection]);

	const renderSlidingText = (text: string, layoutClasses: string) => (
		<p className={`${layoutClasses} ${COLLABORATION_STYLE.SLIDING_TEXT}`}>
			{Array(5)
				.fill(text)
				.reduce((str, el) => str.concat(el), "")}
		</p>
	);

	const renderTitle = () => (
		<h2
			ref={quoteRef}
			className={`${COLLABORATION_STYLE.TITLE} ${willChange ? "will-change-opacity" : ""
				}`}
		>
			Interested in{" "}
			<span className="text-strong font-bold">
				Analytics Engineering
			</span>
			?
		</h2>
	);

	return (
		<section className={COLLABORATION_STYLE.SECTION} ref={targetSection}>
			{renderSlidingText(" dbt - Airflow - Snowflake -  ", "ui-left")}

			{renderTitle()}

			<div className="flex justify-center mt-6">
				<a
					href="https://www.linkedin.com/in/minhbphamm/"
					target="_blank"
					rel="noreferrer"
					className="collab-btn inline-flex items-center gap-2 px-8 py-3 rounded-full text-gray-900 font-bold text-lg transition-all duration-[10ms] hover:-translate-y-1 hover:scale-105"
					onClick={() => trackEvent("collaboration_connect")}
				>
					Let's Connect
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
						<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				</a>
			</div>

			{renderSlidingText(
				" dbt - Airflow - Snowflake -  ",
				"mt-6 md:mt-8 ui-right"
			)}
		</section>
	);
};

export default CollaborationSection;
