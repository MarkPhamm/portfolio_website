import React, { useEffect, useRef, useState } from "react";
import { MENULINKS, PROJECTS, ProjectTypes } from "../../constants";
import ProjectTile from "../common/project-tile";
import { IDesktop } from "pages";
import { trackEvent } from "../../utils/clarity";

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

const ProjectsSection = ({ isDesktop }: IDesktop) => {
	const targetSectionRef = useRef<HTMLDivElement>(null);
	const [activeCategory, setActiveCategory] = useState(ProjectTypes.FEATURED);
	const [isAnimating, setIsAnimating] = useState(false);

	const handleCategoryChange = (category: string) => {
		if (category === activeCategory) return;
		trackEvent("project_category_filter", { category });
		setIsAnimating(true);
		setTimeout(() => {
			setActiveCategory(category);
			setIsAnimating(false);
		}, 300);
	};

	const filteredProjects = PROJECTS.filter((project) =>
		matchesCategory(project, activeCategory)
	);

	const renderSectionTitle = (): React.ReactNode => (
		<div className="flex flex-col inner-container">
			<h2 className="section-heading seq">My Works</h2>
			<h3 className="text-xl md:text-2xl md:max-w-3xl w-full seq mt-2 text-gray-200">
				What I do at 2 AM on a Saturday
			</h3>
		</div>
	);


	const renderCategoryFilters = (): React.ReactNode => (
		<div className="grid grid-cols-2 gap-3 mt-8 mb-10 sm:flex sm:flex-wrap">
			{CATEGORIES.map((category) => {
				const count = PROJECTS.filter((p) => matchesCategory(p, category.value)).length;
				return (
					<button
						key={category.value}
						onClick={() => handleCategoryChange(category.value)}
						className={`
							inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-[10ms]
							${
								activeCategory === category.value
									? "bg-[#9146FF] text-white shadow-lg shadow-[#9146FF]/20"
									: "bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50"
							}
						`}
					>
						{category.label}
						<span className={`ml-2 text-xs ${activeCategory === category.value ? "opacity-80" : "opacity-60"}`}>
							({count})
						</span>
					</button>
				);
			})}
		</div>
	);

	const renderProjectGrid = (): React.ReactNode => (
		<div
			className={`
				grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8
				transition-all duration-[10ms]
				${isAnimating ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}
			`}
		>
			{filteredProjects.map((project, index) => (
				<ProjectTile
					project={project}
					key={`${project.name}-${activeCategory}`}
					index={index}
				/>
			))}
		</div>
	);

	const { ref: projectsSectionRef } = MENULINKS[3];

	return (
		<section
			ref={targetSectionRef}
			className={`${isDesktop && "min-h-screen"} w-full relative select-none section-container flex-col flex py-8 md:py-12 justify-center`}
			id={projectsSectionRef}
			style={{
				zIndex: 10,
				isolation: "isolate",
			}}
		>
			{renderSectionTitle()}
			{renderCategoryFilters()}
			{renderProjectGrid()}
		</section>
	);
};

export default ProjectsSection;
