import { MENULINKS, SKILLS } from "../../constants";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback, memo } from "react";
// @ts-ignore
import ReactDOM from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { IDesktop } from "pages";
import {
	TbChartBar,
	TbDatabase,
	TbCpu,
	TbGitBranch,
	TbActivity,
	TbCloud,
	TbPlug,
	TbSettings,
} from "react-icons/tb";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
	"Business Intelligence": TbChartBar,
	"Warehouse and Lakehouse": TbDatabase,
	"Data Processing": TbCpu,
	"Orchestration": TbGitBranch,
	"Streaming": TbActivity,
	"Cloud (AWS)": TbCloud,
	"Data Integration": TbPlug,
	"DevOps": TbSettings,
};

const SkillIcon = ({ skill, src }: { skill: string; src: string }) => {
	const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

	return (
		<div
			className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 hover:scale-[1.15] transition-transform duration-[10ms] cursor-pointer"
			onMouseEnter={(e) => {
				const rect = e.currentTarget.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;
				const unscaledHalf = rect.height / 2 / 1.15;
				setTooltip({ x: centerX, y: centerY - unscaledHalf });
			}}
			onMouseLeave={() => setTooltip(null)}
		>
			<Image
				src={src}
				alt={skill}
				layout="fill"
				objectFit="contain"
				className="skill"
				loading="lazy"
			/>
			{tooltip && ReactDOM.createPortal(
				<div
					className="fixed px-3 py-1.5 text-xs bg-white text-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
					style={{ left: tooltip.x, top: tooltip.y - 8, transform: "translate(-50%, -100%)", zIndex: 9999 }}
				>
					{skill}
					<div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
				</div>,
				document.body
			)}
		</div>
	);
};

const SKILL_STYLES = {
	SECTION:
		"w-full relative select-none mb-6 section-container py-8 md:py-12 flex flex-col justify-center",
	SKILL_TITLE: "section-title-sm seq",
};

const PNG_SKILLS = [
	"Apache Iceberg", "Delta Lake", "Trino", "Flink", "S3", "EC2", "Lambda",
	"MWAA", "VPC", "Spark Streaming", "Kinesis Firehose", "PubSub", "Looker",
	"Hadoop", "Hive",
];

const SkillsSection = ({ isDesktop }: IDesktop) => {
	const targetSection = useRef<HTMLDivElement>(null);
	const cardsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!cardsRef.current) return;

		const cards = cardsRef.current.querySelectorAll(".skill-card");
		const triggers: ScrollTrigger[] = [];

		// Set initial state
		gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });

		// Stagger from center outward when section enters view
		const trigger = ScrollTrigger.create({
			trigger: cardsRef.current,
			start: "top 80%",
			once: true,
			onEnter: () => {
				gsap.to(cards, {
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.7,
					ease: "power2.out",
					stagger: {
						amount: 0.6,
						grid: [4, 2],
						from: "start",
					},
				});
			},
		});
		triggers.push(trigger);

		// ClipPath wipe on section heading
		const heading = cardsRef.current.querySelector(".section-heading");
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
	}, []);

	const renderSectionTitle = useCallback(
		(): React.ReactNode => (
			<div className="flex flex-col">
				<h1 className="section-heading">My Skills</h1>
				<h2 className="text-2xl md:max-w-2xl w-full mt-2">
					Technical skills & tools I use to deliver data-driven solutions
				</h2>
			</div>
		),
		[]
	);

	const renderBackgroundPattern = useCallback(
		(): React.ReactNode => (
			<>
				<div className="absolute right-0 -bottom-1/3 w-1/5 max-w-xs md:flex hidden justify-end">
					<Image
						src="/pattern-r.svg"
						height={700}
						width={320}
						alt="pattern"
						loading="lazy"
					/>
				</div>
				<div className="absolute left-0 -bottom-3.5 w-1/12 max-w-xs md:block hidden">
					<Image
						src="/pattern-l.svg"
						height={335}
						width={140}
						alt="pattern"
						loading="lazy"
					/>
				</div>
			</>
		),
		[]
	);

	const getSkillImagePath = useCallback((skill: string): string => {
		return `/skills/1st/${skill}.${PNG_SKILLS.includes(skill) ? "webp" : "svg"}`;
	}, []);

	const renderSkillColumn = useCallback(
		(title: string, skills: string[]): React.ReactNode => {
			const Icon = CATEGORY_ICONS[title];
			return (
				<div
					key={title}
					className="skill-card p-6 rounded-2xl border border-gray-800/50 bg-gray-900/30 backdrop-blur-sm hover:border-[#9146FF]/30 transition-all duration-[10ms] relative overflow-hidden"
				>
					{/* Gradient accent line at top */}
					<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9146FF] via-[#BF94FF] to-[#9146FF] opacity-40" />

					{/* Category header with icon */}
					<div className="flex items-center gap-2 mb-4">
						{Icon && (
							<div className="w-5 h-5 rounded bg-[#9146FF]/10 flex items-center justify-center flex-shrink-0">
								<Icon className="w-3 h-3 text-[#BF94FF]" />
							</div>
						)}
						<h3 className={SKILL_STYLES.SKILL_TITLE}>{title}</h3>
					</div>

					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 lg:gap-3 xl:gap-4 2xl:gap-5 place-items-center">
						{skills.map((skill) => (
							<SkillIcon key={skill} skill={skill} src={getSkillImagePath(skill)} />
						))}
					</div>
				</div>
			);
		},
		[getSkillImagePath]
	);

	const SKILL_GROUPS = [
		["Business Intelligence", "Warehouse and Lakehouse"],
		["Data Processing", "Orchestration"],
		["Streaming", "Cloud (AWS)"],
		["Data Integration", "DevOps"],
	];

	return (
		<section className="relative">
			{renderBackgroundPattern()}
			<div
				className={SKILL_STYLES.SECTION}
				id={MENULINKS[1].ref}
				ref={targetSection}
			>
				<div className="flex flex-col" ref={cardsRef}>
					{renderSectionTitle()}

					{SKILL_GROUPS.map((group, i) => (
						<div
							key={i}
							className="grid lg:grid-cols-2 md:grid-cols-1 mt-10 gap-8 xl:gap-12 2xl:gap-16"
						>
							{group.map((title) => renderSkillColumn(title, (SKILLS as any)[title]))}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default SkillsSection;
