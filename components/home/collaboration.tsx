import { gsap } from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { trackEvent } from "../../utils/clarity";
import { NO_MOTION_PREFERENCE_QUERY, initMagneticHover } from "../../utils/motion";

// Not imported from "pages" — that dragged the homepage module into every
// subpage bundle (this section also renders on Passion / Start-up / Reads).
const isSmallScreen = (): boolean => window.innerWidth < 767;

const COLLABORATION_STYLE = {
	SLIDING_TEXT:
		"collab-marquee opacity-60 motion-reduce:opacity-40 text-6xl md:text-8xl font-light tracking-[-0.03em] whitespace-nowrap leading-none",
	SECTION:
		"w-full relative select-none overflow-hidden py-24 md:py-40 section-container flex flex-col",
	TITLE:
		"relative mt-10 md:mt-14 text-center font-light text-[clamp(2.5rem,6vw,5.75rem)] leading-[1.02] tracking-[-0.035em]",
};

const CollaborationSection = () => {
	const quoteRef = useRef<HTMLDivElement>(null);
	const targetSection = useRef<HTMLDivElement>(null);
	const ctaRef = useRef<HTMLAnchorElement>(null);

	const [willChange, setwillChange] = useState(false);

	const initTextGradientAnimation = (
		targetSection: React.RefObject<HTMLDivElement | null>
	): ScrollTrigger => {
		if (!quoteRef.current || !targetSection.current) return ScrollTrigger.create({});
		const timeline = gsap.timeline({ defaults: { ease: "none" } });
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
		const slidingTl = gsap.timeline({ defaults: { ease: "none" } });

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

	// Magnetic hover on the CTA (desktop pointers only, respects reduced motion)
	useEffect(() => initMagneticHover(ctaRef.current), []);

	const renderSlidingText = (text: string, layoutClasses: string) => (
		<p className={`${layoutClasses} ${COLLABORATION_STYLE.SLIDING_TEXT}`} aria-hidden="true">
			{Array(5)
				.fill(text)
				.reduce((str, el) => str.concat(el), "")}
		</p>
	);

	const renderTitle = () => (
		<h2
			ref={quoteRef}
			className={`${COLLABORATION_STYLE.TITLE} ${willChange ? "will-change-opacity" : ""}`}
		>
			<span className="text-ink-2">Interested in</span>{" "}
			<span className="text-strong">Analytics Engineering</span>
			<span className="text-ink-1">?</span>
		</h2>
	);

	return (
		<section className={COLLABORATION_STYLE.SECTION} ref={targetSection}>
			{renderSlidingText(" dbt - Airflow - Redshift -  ", "ui-left")}

			{renderTitle()}

			<div className="relative mb-10 mt-10 flex justify-center md:mb-14">
				<a
					ref={ctaRef}
					href="https://www.linkedin.com/in/minhbphamm/"
					target="_blank"
					rel="noreferrer"
					className="btn-pill btn-primary"
					onClick={() => trackEvent("collaboration_connect")}
				>
					Let&apos;s Connect
					<span className="btn-disc" aria-hidden="true">
						↗
					</span>
				</a>
			</div>

			{renderSlidingText(" dbt - Airflow - Redshift -  ", "ui-right")}
		</section>
	);
};

export default CollaborationSection;
