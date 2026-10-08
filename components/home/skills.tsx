import { MENULINKS, SKILLS, getTechUrl } from "../../constants";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
// @ts-ignore
import ReactDOM from "react-dom";
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
import SectionHeader from "../common/section-header";
import { revealUp } from "../../utils/motion";

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
	const url = getTechUrl(skill);

	// Smooth scrolling moves the tile out from under a fixed tooltip — drop it.
	useEffect(() => {
		if (!tooltip) return;
		const hide = () => setTooltip(null);
		window.addEventListener("scroll", hide, { passive: true, once: true });
		return () => window.removeEventListener("scroll", hide);
	}, [tooltip]);

	const icon = (
		<div
			className="relative grid h-14 w-14 cursor-pointer place-items-center rounded-2xl border border-line bg-white/[0.02] transition-colors duration-[10ms] hover:border-line-strong hover:bg-white/[0.06] md:h-16 md:w-16"
			onMouseEnter={(e) => {
				const rect = e.currentTarget.getBoundingClientRect();
				setTooltip({ x: rect.left + rect.width / 2, y: rect.top });
			}}
			onMouseLeave={() => setTooltip(null)}
		>
			<div className="relative h-8 w-8 md:h-9 md:w-9">
				<Image
					src={src}
					alt={skill}
					layout="fill"
					objectFit="contain"
					className="skill"
					loading="lazy"
				/>
			</div>
			{tooltip && ReactDOM.createPortal(
				<div
					className="glass pointer-events-none fixed whitespace-nowrap rounded-lg px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] text-ink-1 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)]"
					style={{ left: tooltip.x, top: tooltip.y - 10, transform: "translate(-50%, -100%)", zIndex: 9999 }}
				>
					{skill}
				</div>,
				document.body
			)}
		</div>
	);

	// Real products link out to their official site; concept-only icons render
	// as-is (no link).
	return url ? (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${skill} — opens in new tab`}
			className="block"
		>
			{icon}
		</a>
	) : (
		icon
	);
};

const SKILL_STYLES = {
	SECTION:
		"w-full relative select-none section-container py-24 md:py-36 flex flex-col justify-center",
};

const PNG_SKILLS = [
	"Apache Iceberg", "Delta Lake", "Trino", "Flink", "S3", "EC2", "Lambda",
	"MWAA", "VPC", "Spark Streaming", "Kinesis Firehose", "PubSub", "Looker",
	"Hadoop", "Hive", "Omni", "ClickHouse", "Prefect", "IAM", "GitLab",
	"Hightouch",
];

const SKILL_GROUPS = [
	["Business Intelligence", "Warehouse and Lakehouse"],
	["Data Processing", "Orchestration"],
	["Streaming", "Cloud (AWS)"],
	["Data Integration", "DevOps"],
];

const SkillsSection = ({ isDesktop }: IDesktop) => {
	const targetSection = useRef<HTMLDivElement>(null);
	const cardsRef = useRef<HTMLDivElement>(null);

	// Panels rise in batches as they scroll in.
	useEffect(() => {
		if (!cardsRef.current) return;
		return revealUp(cardsRef.current.querySelectorAll(".skill-card"), { stagger: 0.06 });
	}, []);

	const getSkillImagePath = useCallback((skill: string): string => {
		return `/skills/1st/${skill}.${PNG_SKILLS.includes(skill) ? "webp" : "svg"}`;
	}, []);

	const renderSkillColumn = useCallback(
		(title: string, skills: string[], index: number): React.ReactNode => {
			const Icon = CATEGORY_ICONS[title];
			return (
				<div
					key={title}
					className="skill-card relative overflow-hidden rounded-[24px] border border-line bg-surface-1/60 p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-colors duration-[10ms] hover:border-line-strong md:p-8"
				>
					{/* Category header: index, icon, mono label */}
					<div className="mb-6 flex items-center gap-3">
						<span className="font-mono text-[11px] tracking-[0.14em] text-ink-3">
							{String(index + 1).padStart(2, "0")}
						</span>
						{Icon && <Icon className="h-4 w-4 flex-shrink-0 text-accent-soft" aria-hidden="true" />}
						<h3 className="mono-label">{title}</h3>
					</div>

					{(() => {
						const needsGrid = skills.length >= 5;
						const cols = skills.length >= 6 ? "md:grid-cols-6" : "md:grid-cols-5";
						const wrapperCls = needsGrid
							? `flex flex-wrap justify-center gap-y-3 sm:gap-y-4 md:grid ${cols} md:gap-3 md:place-items-center lg:gap-3 xl:gap-4 2xl:gap-5`
							: `flex flex-wrap justify-center gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-4 md:grid ${cols} md:gap-3 md:place-items-center lg:gap-3 xl:gap-4 2xl:gap-5`;
						const itemCls = needsGrid
							? "basis-1/3 flex justify-center md:basis-auto"
							: "flex justify-center md:basis-auto";
						return (
							<div className={wrapperCls}>
								{skills.map((skill) => (
									<div key={skill} className={itemCls}>
										<SkillIcon skill={skill} src={getSkillImagePath(skill)} />
									</div>
								))}
							</div>
						);
					})()}
				</div>
			);
		},
		[getSkillImagePath]
	);

	return (
		<section className="relative">
			<div
				className={SKILL_STYLES.SECTION}
				id={MENULINKS[1].ref}
				ref={targetSection}
			>
				<div className="flex flex-col" ref={cardsRef}>
					<SectionHeader
						index="04"
						eyebrow="Skillset"
						title="My Skills"
						tagline="Technical skills & tools I use to deliver data-driven solutions"
						className="mb-12 md:mb-16"
					/>

					<div className="flex flex-col gap-6 xl:gap-8">
						{SKILL_GROUPS.map((group, i) => (
							<div key={i} className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:gap-8">
								{group.map((title, j) =>
									renderSkillColumn(title, (SKILLS as any)[title], i * 2 + j)
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default SkillsSection;
