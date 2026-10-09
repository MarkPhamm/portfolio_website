import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MENULINKS, PROJECTS, ProjectTypes } from "../../constants";
import ProjectTile from "../common/project-tile";
import SectionHeader from "../common/section-header";
import { IDesktop } from "pages";
import { trackEvent } from "../../utils/clarity";
import { EASE, prefersReducedMotion, revealUp } from "../../utils/motion";

const CATEGORIES = [
	{ value: ProjectTypes.FEATURED, label: "Featured" },
	{ value: ProjectTypes.ENDTOEND, label: "Data Pipeline" },
	{ value: ProjectTypes.STATISTICSML, label: "ML & Statistics" },
	{ value: ProjectTypes.BIDASHBOARDVIZ, label: "BI & Dashboards" },
	{ value: ProjectTypes.CLOUDINFRA, label: "Cloud & Infra" },
	{ value: ProjectTypes.LEARNING, label: "Learning" },
];

const matchesCategory = (project: typeof PROJECTS[number], category: string) =>
	category === ProjectTypes.FEATURED ? !!project.featured : project.category === category;

const pad = (n: number) => String(n).padStart(2, "0");

const ProjectsSection = ({ isDesktop }: IDesktop) => {
	const targetSectionRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLUListElement>(null);
	const [activeCategory, setActiveCategory] = useState(ProjectTypes.FEATURED);
	const isFirstRender = useRef(true);
	const isSwitching = useRef(false);

	// Cards rise in as the grid scrolls into view.
	useEffect(() => {
		if (!gridRef.current) return;
		return revealUp(gridRef.current.querySelectorAll(".project-tile-wrap"));
	}, []);

	const handleCategoryChange = (category: string) => {
		if (category === activeCategory || isSwitching.current) return;
		trackEvent("project_category_filter", { category });

		if (prefersReducedMotion() || !gridRef.current) {
			setActiveCategory(category);
			return;
		}

		// Quick fade-out, then the new tiles cascade in (see the effect below)
		isSwitching.current = true;
		gsap.to(gridRef.current, {
			opacity: 0,
			y: 8,
			duration: 0.15,
			ease: "power2.in",
			onComplete: () => {
				isSwitching.current = false;
				setActiveCategory(category);
			},
		});
	};

	// Cascade the tiles in like dealt cards whenever the filter changes
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (prefersReducedMotion() || !gridRef.current) return;

		gsap.set(gridRef.current, { opacity: 1, y: 0 });
		gsap.from(gridRef.current.querySelectorAll(".project-tile-wrap"), {
			opacity: 0,
			y: 24,
			duration: 0.5,
			ease: EASE.out,
			stagger: 0.04,
			clearProps: "opacity,transform",
		});
	}, [activeCategory]);

	const filteredProjects = PROJECTS.filter((project) =>
		matchesCategory(project, activeCategory)
	);

	const renderCategoryFilters = (): React.ReactNode => (
		<div className="mb-10 mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Filter projects">
			{CATEGORIES.map((category) => {
				const count = PROJECTS.filter((p) => matchesCategory(p, category.value)).length;
				const active = activeCategory === category.value;
				return (
					<button
						key={category.value}
						type="button"
						aria-pressed={active}
						onClick={() => handleCategoryChange(category.value)}
						className={`inline-flex h-full w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-[13px] leading-tight transition-colors duration-[10ms] sm:w-auto ${
							active
								? "border-transparent bg-ink-1 text-canvas"
								: "border-line text-ink-2 hover:border-line-strong hover:text-ink-1"
						}`}
					>
						{category.label}
						<span className={`font-mono text-[11px] ${active ? "text-canvas/60" : "text-ink-3"}`}>
							{pad(count)}
						</span>
					</button>
				);
			})}
		</div>
	);

	const { ref: projectsSectionRef } = MENULINKS[3];

	return (
		<section
			ref={targetSectionRef}
			className={`${isDesktop && "min-h-screen"} w-full relative select-none section-container flex flex-col py-24 md:py-36 justify-center`}
			id={projectsSectionRef}
			style={{
				zIndex: 10,
				isolation: "isolate",
			}}
		>
			<SectionHeader
				index="06"
				eyebrow="Projects"
				title="My Works"
				inlineTagline="what I do at 2 AM on a Saturday"
			/>
			{renderCategoryFilters()}
			<ul ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
				{filteredProjects.map((project, index) => (
					<li className="project-tile-wrap h-full" key={`${project.name}-${activeCategory}`}>
						<ProjectTile project={project} index={index} />
					</li>
				))}
			</ul>
		</section>
	);
};

export default ProjectsSection;
