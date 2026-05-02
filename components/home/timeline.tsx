// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { useEffect, useRef, useState } from "react";
import {
	MENULINKS,
	NodeTypes,
	TIMELINE,
	CheckpointNode,
	ItemSize,
} from "../../constants";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { IDesktop } from "pages";
import { trackEvent } from "../../utils/clarity";

interface ExperienceItem {
	date: string;
	title: string;
	subtitle: string;
	location: string;
	image: string;
	slideImage: string;
	companyLogo?: string;
	companyUrl?: string;
}

// Process TIMELINE data to extract experiences with their dates
const processTimelineData = (): ExperienceItem[] => {
	const experiences: ExperienceItem[] = [];
	let currentDate = "";

	TIMELINE.forEach((item) => {
		if (item.type === NodeTypes.CHECKPOINT) {
			const checkpoint = item as CheckpointNode;
			if (checkpoint.size === ItemSize.LARGE && !checkpoint.shouldDrawLine) {
				// This is a date entry
				currentDate = checkpoint.title;
			} else if (checkpoint.shouldDrawLine && checkpoint.slideImage) {
				// This is an experience entry
				experiences.push({
					date: currentDate,
					title: checkpoint.title,
					subtitle: checkpoint.subtitle || "",
					location: checkpoint.location || "",
					image: checkpoint.image || "",
					slideImage: checkpoint.slideImage,
					companyLogo: checkpoint.companyLogo,
					companyUrl: checkpoint.companyUrl,
				});
			}
		}
	});

	return experiences;
};

const TimelineSection = (_props: IDesktop) => {
	const [isMounted, setIsMounted] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);
	const experiencesRef = useRef<(HTMLDivElement | null)[]>([]);

	const experiences = processTimelineData();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Animate experience cards on scroll — alternate left/right slide
	useEffect(() => {
		if (!isMounted || !sectionRef.current) return;

		const triggers: ScrollTrigger[] = [];

		experiencesRef.current.forEach((el, idx) => {
			if (!el) return;

			const isEven = idx % 2 === 0;
			// Set initial state: slide from left for even, right for odd
			gsap.set(el, { opacity: 0, x: isEven ? -60 : 60, y: 20 });

			const trigger = ScrollTrigger.create({
				trigger: el,
				start: "top 85%",
				onEnter: () => {
					gsap.to(el, {
						opacity: 1,
						x: 0,
						y: 0,
						duration: 0.7,
						ease: "power2.out",
					});
				},
				once: true,
			});
			triggers.push(trigger);
		});

		// ClipPath wipe on section heading
		const heading = sectionRef.current.querySelector(".section-heading");
		if (heading) {
			gsap.set(heading, { clipPath: "inset(0 100% 0 0)" });
			const headingTrigger = ScrollTrigger.create({
				trigger: heading,
				start: "top 85%",
				once: true,
				onEnter: () => {
					gsap.to(heading, {
						clipPath: "inset(0 0% 0 0)",
						duration: 0.8,
						ease: "power2.inOut",
					});
				},
			});
			triggers.push(headingTrigger);
		}

		return () => {
			triggers.forEach((t) => t.kill());
		};
	}, [isMounted, experiences.length]);

	const renderSectionTitle = (): React.ReactNode => (
		<div className="flex flex-col mb-16">
			<h2 className="section-heading seq">Timeline</h2>
			<h3 className="text-2xl md:max-w-2xl w-full seq mt-2">
				A quick recap of proud moments
			</h3>
		</div>
	);

	const renderExperienceCard = (
		experience: ExperienceItem,
		index: number
	): React.ReactNode => {
		const isEven = index % 2 === 0;

		return (
			<div
				key={`exp-${index}`}
				ref={(el) => (experiencesRef.current[index] = el)}
				className="relative mb-16 last:mb-0"
			>
				{/* Timeline connector */}
				<div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gray-700 transform md:-translate-x-1/2">
					{/* Dot */}
					<div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 border-2 border-[#9146FF] rounded-full z-10 timeline-dot-glow"></div>
				</div>

				{/* Content wrapper */}
				<div
					className={`flex flex-col md:flex-row items-start gap-8 transition-all duration-[10ms] hover:-translate-y-1 ${isEven ? "md:flex-row" : "md:flex-row-reverse"
						}`}
				>
					{/* Date and Info side */}
					<div
						className={`w-full md:w-1/2 pl-10 overflow-hidden ${isEven ? "md:pr-12 md:pl-0 md:text-right" : "md:pl-12 md:text-left"
							}`}
					>
						<span className="inline-block text-[#BF94FF] text-lg font-semibold mb-2">
							{experience.date}
						</span>
						<h4
							className="text-xl md:text-2xl font-bold text-white mb-3"
							dangerouslySetInnerHTML={{ __html: experience.title }}
						/>
						<div className={`overflow-hidden ${isEven ? "md:text-right" : "md:text-left"}`}>
							<p className={`text-gray-200 text-[clamp(0.65rem,1.5vw,1rem)] leading-relaxed ${isEven ? "md:float-right" : ""}`}>
								{experience.subtitle}
							</p>
						</div>
						{experience.location && (
							<span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-sm font-medium bg-gray-800/80 text-gray-200 border border-gray-700 ${isEven ? "md:ml-auto" : ""}`}>
								<svg className="w-3.5 h-3.5 text-[#9146FF]" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
								</svg>
								{experience.location}
							</span>
						)}
					</div>

					{/* Image side */}
					<div
						className={`w-full md:w-1/2 pl-10 ${isEven ? "md:pl-12" : "md:pl-0 md:pr-12"
							}`}
					>
						{experience.companyUrl ? (
							<a
								href={experience.companyUrl}
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => trackEvent("timeline_company_click", { company: experience.title.replace(/<[^>]*>/g, "") })}
								className="block relative group cursor-pointer"
							>
								<div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-gray-800 transform transition-all duration-[10ms] group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)]">
									<Image
										src={experience.slideImage}
										alt={experience.title.replace(/<[^>]*>/g, "")}
										layout="fill"
										objectFit="cover"
										className="transition-transform duration-[10ms] group-hover:scale-105"
										loading="eager"
									/>
									{/* Permanent overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
									{/* Hover overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[10ms]"></div>
								</div>
								{/* Decorative border */}
								<div className="absolute -inset-1 bg-gradient-to-r from-[#9146FF]/20 to-yellow-600/20 rounded-xl blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-[10ms]"></div>
							</a>
						) : (
							<div className="relative group">
								<div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-gray-800 transform transition-all duration-[10ms] group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)]">
									<Image
										src={experience.slideImage}
										alt={experience.title.replace(/<[^>]*>/g, "")}
										layout="fill"
										objectFit="cover"
										className="transition-transform duration-[10ms] group-hover:scale-105"
										loading="eager"
									/>
									{/* Permanent overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
									{/* Hover overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[10ms]"></div>
								</div>
								{/* Decorative border */}
								<div className="absolute -inset-1 bg-gradient-to-r from-[#9146FF]/20 to-yellow-600/20 rounded-xl blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-[10ms]"></div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<section
			ref={sectionRef}
			className="w-full relative select-none section-container py-8 md:py-12 flex flex-col"
			id={MENULINKS[4].ref}
		>
			{renderSectionTitle()}

			<div className="relative">
				{/* Main timeline line */}
				<div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#9146FF]/50 via-[#9146FF]/20 to-transparent transform md:-translate-x-1/2"></div>

				{/* Experience cards */}
				<div className="relative">
					{experiences.map((experience, index) =>
						renderExperienceCard(experience, index)
					)}
				</div>

				{/* End dot */}
				<div className="absolute left-0 md:left-1/2 bottom-0 transform md:-translate-x-1/2">
					<div className="w-4 h-4 bg-gray-900 border-2 border-gray-600 rounded-full"></div>
				</div>
			</div>
		</section>
	);
};

export default TimelineSection;
