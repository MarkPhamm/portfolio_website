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
import { EASE, clipReveal, prefersReducedMotion, revealUp } from "../../utils/motion";
import { TOKENS } from "../../utils/tokens";
import SectionHeader from "../common/section-header";

interface ExperienceItem {
	date: string;
	title: string;
	subtitle: string;
	location: string;
	image: string;
	slideImage: string;
	companyLogo?: string;
	companyUrl?: string;
	techStack?: Array<{ name: string; icon: string }>;
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
					techStack: checkpoint.techStack,
				});
			}
		}
	});

	return experiences;
};

// Lit state for a rail dot once the line reaches it.
const DOT_LIT = {
	backgroundColor: TOKENS.violetSoft,
	borderColor: TOKENS.violetSoft,
	boxShadow: "0 0 14px rgba(191, 148, 255, 0.7)",
};

const TimelineSection = (_props: IDesktop) => {
	const [isMounted, setIsMounted] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);
	const experiencesRef = useRef<(HTMLDivElement | null)[]>([]);

	const experiences = processTimelineData();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Text rises in, images open from an inset clip, the rail draws itself
	// as each entry scrolls through, and each dot lights when the line
	// reaches it.
	useEffect(() => {
		if (!isMounted || !sectionRef.current) return;
		const section = sectionRef.current;
		const triggers: ScrollTrigger[] = [];
		const cleanups: Array<() => void> = [
			revealUp(section.querySelectorAll(".tl-info"), { y: 32 }),
		];

		const reduceMotion = prefersReducedMotion();

		experiencesRef.current.forEach((el) => {
			if (!el) return;
			const frame = el.querySelector<HTMLElement>(".tl-frame");
			cleanups.push(clipReveal(frame, frame?.querySelector<HTMLElement>(".tl-img"), { radius: 20 }));

			const dot = el.querySelector(".timeline-dot");
			if (reduceMotion) {
				if (dot) gsap.set(dot, DOT_LIT);
				return;
			}

			// Rail segment draws itself as the entry scrolls through the viewport;
			// chained per entry it reads as one continuous line.
			const seg = el.querySelector(".timeline-rail-seg");
			if (seg) {
				const draw = gsap.fromTo(
					seg,
					{ scaleY: 0, transformOrigin: "top center" },
					{
						scaleY: 1,
						ease: "none",
						scrollTrigger: {
							trigger: el,
							start: "top 80%",
							end: "bottom 60%",
							scrub: true,
						},
					}
				);
				if (draw.scrollTrigger) triggers.push(draw.scrollTrigger);
			}

			if (dot) {
				triggers.push(
					ScrollTrigger.create({
						trigger: el,
						start: "top 70%",
						once: true,
						onEnter: () => {
							gsap.to(dot, { ...DOT_LIT, duration: 0.35, ease: EASE.out });
							gsap.fromTo(dot, { scale: 0.6 }, { scale: 1, duration: 0.4, ease: EASE.out });
						},
					})
				);
			}
		});

		return () => {
			triggers.forEach((t) => t.kill());
			cleanups.forEach((fn) => fn());
		};
	}, [isMounted, experiences.length]);

	const renderImage = (experience: ExperienceItem): React.ReactNode => (
		<div className="tl-frame relative aspect-video w-full overflow-hidden rounded-[20px] border border-line bg-surface-2 transition-colors duration-[10ms] group-hover:border-line-strong">
			<div className="tl-img absolute inset-0">
				<Image
					src={experience.slideImage}
					alt={experience.title.replace(/<[^>]*>/g, "")}
					layout="fill"
					objectFit="cover"
					className="transition-transform duration-[10ms] group-hover:scale-[1.03]"
					loading="lazy"
				/>
			</div>
			<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
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
				className="relative mb-20 last:mb-0 md:mb-28"
			>
				{/* Timeline connector */}
				<div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px transform md:-translate-x-1/2">
					{/* Rail segment (draws on scroll; sibling of the dot so its scaleY doesn't distort it) */}
					<div
						className="timeline-rail-seg absolute inset-0 bg-gradient-to-b from-violet-soft/80 via-violet/40 to-transparent shadow-[0_0_12px_rgb(var(--accent)/0.5)]"
						aria-hidden="true"
					></div>
					{/* Dot */}
					<div className="timeline-dot timeline-dot-glow absolute left-1/2 top-8 z-10 h-[11px] w-[11px] -translate-x-1/2 transform rounded-full border border-line-strong bg-canvas"></div>
				</div>

				{/* Content wrapper */}
				<div
					className={`flex flex-col md:flex-row items-start gap-8 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
				>
					{/* Date and Info side */}
					<div
						className={`tl-info w-full md:w-1/2 pl-10 overflow-hidden ${isEven ? "md:pr-14 md:pl-0 md:text-right" : "md:pl-14 md:text-left"}`}
					>
						<span
							className={`mb-3 inline-block font-mono text-[11px] uppercase tracking-[0.14em] ${
								index === 0 ? "text-accent-soft" : "text-ink-3"
							}`}
						>
							{experience.date}
						</span>
						<h3
							className="mb-3 text-xl font-normal leading-snug tracking-[-0.02em] text-ink-1 md:text-2xl [&_a]:transition-colors [&_a]:duration-[10ms] [&_u]:decoration-white/25 [&_u]:underline-offset-4 hover:[&_u]:decoration-white/60"
							dangerouslySetInnerHTML={{ __html: experience.title }}
						/>
						<div className={`overflow-hidden ${isEven ? "md:text-right" : "md:text-left"}`}>
							<p className={`text-sm leading-relaxed text-ink-2 md:text-[15px] ${isEven ? "md:float-right" : ""}`}>
								{experience.subtitle}
							</p>
						</div>
						{experience.techStack && experience.techStack.length > 0 && (
							<div
								className={`flex flex-wrap items-center gap-2 mt-5 ${isEven ? "md:justify-end" : "md:justify-start"}`}
							>
								{experience.techStack.map((tech) => (
									<span
										key={tech.name}
										className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/[0.03] p-1.5 transition-colors duration-[10ms] hover:border-line-strong hover:bg-white/[0.06]"
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={tech.icon}
											alt={tech.name}
											className="w-full h-full object-contain"
											loading="lazy"
										/>
										<span className="glass pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px] text-ink-1 opacity-0 transition-opacity duration-[10ms] group-hover:opacity-100">
											{tech.name}
										</span>
									</span>
								))}
							</div>
						)}
						{experience.location && (
							<span className={`mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 ${isEven ? "md:ml-auto" : ""}`}>
								<svg className="h-3 w-3 text-accent-soft" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
									<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
								</svg>
								{experience.location}
							</span>
						)}
					</div>

					{/* Image side */}
					<div
						className={`w-full md:w-1/2 pl-10 ${isEven ? "md:pl-14" : "md:pl-0 md:pr-14"}`}
					>
						{experience.companyUrl ? (
							<a
								href={experience.companyUrl}
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => trackEvent("timeline_company_click", { company: experience.title.replace(/<[^>]*>/g, "") })}
								className="group relative block cursor-pointer"
							>
								{renderImage(experience)}
							</a>
						) : (
							<div className="group relative">{renderImage(experience)}</div>
						)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<section
			ref={sectionRef}
			className="w-full relative select-none section-container py-24 md:py-36 flex flex-col"
			id={MENULINKS[4].ref}
		>
			<SectionHeader
				index="08"
				eyebrow="Experience"
				title="Timeline"
				inlineTagline="a quick recap of proud moments"
				className="mb-16 md:mb-24"
			/>

			<div className="relative">
				{/* Main timeline track — a hairline the lit per-entry segments draw over */}
				<div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-line transform md:-translate-x-1/2"></div>

				{/* Experience cards */}
				<div className="relative">
					{experiences.map((experience, index) =>
						renderExperienceCard(experience, index)
					)}
				</div>

				{/* End dot */}
				<div className="absolute left-0 md:left-1/2 bottom-0 transform -translate-x-1/2">
					<div className="h-[11px] w-[11px] rounded-full border border-line-strong bg-canvas"></div>
				</div>
			</div>
		</section>
	);
};

export default TimelineSection;
