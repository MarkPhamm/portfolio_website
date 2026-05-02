// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { SKILLS } from "../../constants";
import React, { useEffect, useRef, useState } from "react";
import { gsap, Linear } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { IDesktop } from "pages";
import { memo } from "react";

const Tooltip = memo(({ text, children }: { text: string; children: React.ReactNode }) => {
	return (
		<div className="group/tip relative inline-block">
			{children}
			<div className="absolute invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-opacity duration-[10ms] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm bg-white text-gray-800 rounded-lg shadow-lg whitespace-nowrap z-10">
				{text}
				<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
			</div>
		</div>
	);
});

Tooltip.displayName = "Tooltip";

const CERTIFICATE_STYLES = {
	SECTION:
		"w-full relative select-none mb-12 section-container py-8 md:py-12 flex flex-col justify-center",
};

const CertificateSection = ({ isDesktop }: IDesktop) => {
	const targetSection = useRef<HTMLDivElement>(null);
	const [willChange, setwillChange] = useState(false);

	const initRevealAnimation = (
		targetSection: React.RefObject<HTMLDivElement | null>
	): ScrollTrigger => {
		if (!targetSection.current) return ScrollTrigger.create({});
		const revealTl = gsap.timeline({ defaults: { ease: Linear.easeNone } });
		revealTl.from(
			targetSection.current.querySelectorAll(".seq"),
			{ opacity: 0, duration: 0.5, stagger: 0.5 },
			"<"
		);

		return ScrollTrigger.create({
			trigger: targetSection.current.querySelector(".certificate-wrapper"),
			start: "100px bottom",
			end: `center center`,
			animation: revealTl,
			scrub: 0,
			onToggle: (self) => setwillChange(self.isActive),
		});
	};

	useEffect(() => {
		const revealAnimationRef = initRevealAnimation(targetSection);

		return revealAnimationRef.kill;
	}, [targetSection]);

	const renderSectionTitle = (): React.ReactNode => (
		<div className="flex flex-col">
			<h2 className="section-heading seq">My certifications</h2>
			<h3 className="text-2xl md:max-w-2xl w-full seq mt-2">
				Professional certifications that validate my expertise
			</h3>
		</div>
	);

	const renderCertified = (skill: string): React.ReactNode => (
		<div
			className={`flex flex-col seq ${willChange ? "will-change-opacity" : ""
				} group cursor-pointer`}
		>
			<div
				style={{ height: "310px" }}
				className="flex align-middle justify-center p-4 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-[0_0_30px_-5px_rgba(145,70,255,0.2)] hover:bg-gray-800/70 hover:border-[#9146FF]/30 transition-all duration-[10ms] transform hover:scale-105 hover:-translate-y-2"
			>
				<img
					src={`/skills/3rd/${skill}.webp`}
					alt={skill}
					width="400"
					height="280"
					loading="lazy"
					decoding="async"
					className="object-contain max-w-full max-h-full rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-[10ms]"
				/>
			</div>
		</div>
	);

	return (
		<section className="relative">
			<div
				className={CERTIFICATE_STYLES.SECTION}
				id="certificates"
				ref={targetSection}
			>
				<div className="flex flex-col certificate-wrapper">
					{renderSectionTitle()}
					<div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mt-10 gap-8 lg:gap-10">
						<div className="col-span-1 text-center">
							<Tooltip text="Alteryx Core Designer">
								{renderCertified(SKILLS.alteryx)}
							</Tooltip>
						</div>
						<div className="col-span-1 text-center">
							<Tooltip text="HackerRank SQL Advanced">
								{renderCertified(SKILLS.hackerank)}
							</Tooltip>
						</div>
						<div className="col-span-1 text-center">
							<Tooltip text="Astronomer Apache Airflow Certified">
								{renderCertified(SKILLS.airflow)}
							</Tooltip>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CertificateSection; 