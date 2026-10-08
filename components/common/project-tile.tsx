import Image from "next/image";
import React, { useRef, useState } from "react";
import { IProject, ProjectTypes, getTechIconSrc } from "../../constants";
import ProjectModal from "./project-modal";
import { trackEvent, setTag } from "../../utils/clarity";

export const getCategoryLabel = (category: string): string => {
	switch (category) {
		case ProjectTypes.ENDTOEND:
			return "Data Pipeline";
		case ProjectTypes.BIDASHBOARDVIZ:
			return "BI & Dashboard";
		case ProjectTypes.STATISTICSML:
			return "ML & Statistics";
		case ProjectTypes.CLOUDINFRA:
			return "Cloud & Infra";
		case ProjectTypes.LEARNING:
			return "Learning";
		default:
			return category;
	}
};

/**
 * Project card for the Works grid: screenshot on top, details in the card
 * body (the pre-redesign layout, restyled). Clicking zooms the modal out of
 * the screenshot's frame. Hovers are the house 10ms snap.
 */
const ProjectTile = ({ project, index = 0 }: { project: IProject; index?: number }) => {
	const [showModal, setShowModal] = useState(false);
	// Where the modal zooms from — the frame's viewport rect at open time.
	const [originRect, setOriginRect] = useState<DOMRect | null>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);

	const openModal = () => {
		trackEvent("project_open");
		setTag("project_name", project.name);
		setOriginRect(frameRef.current?.getBoundingClientRect() ?? null);
		setShowModal(true);
	};

	const {
		name,
		tech,
		image,
		category,
		gradient: [stop1, stop2],
	} = project;

	return (
		<>
			<div
				ref={cardRef}
				className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-line bg-surface-1/80 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-colors duration-[10ms] hover:border-line-strong"
				data-cursor-label="View"
				onClick={openModal}
				role="button"
				tabIndex={0}
				aria-label={`${name} — open project details`}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						openModal();
					}
				}}
			>
				<div ref={frameRef} className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface-2">
					<Image
						src={image}
						alt={name}
						layout="fill"
						objectFit="cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
						className="transition-transform duration-[10ms] group-hover:scale-[1.04]"
						loading="lazy"
					/>
					{/* Per-project tint, kept faint so the screenshots read. */}
					<div
						className="absolute inset-0"
						style={{
							background: `linear-gradient(150deg, ${stop1}33 0%, transparent 45%, ${stop2}40 100%)`,
						}}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
					<span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-1">
						{getCategoryLabel(category)}
					</span>
					<span className="absolute bottom-4 right-4 font-mono text-[11px] tracking-[0.14em] text-white/70">
						{String(index + 1).padStart(2, "0")}
					</span>
				</div>

				<div className="flex flex-1 flex-col p-5 md:p-6">
					<div className="flex items-start justify-between gap-5">
						<div className="min-w-0">
							<h3 className="text-xl font-normal tracking-[-0.02em] text-ink-1 transition-colors duration-[10ms] group-hover:text-violet-soft md:text-[1.35rem]">
								{name}
							</h3>
							{project.description && (
								<p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-2">
									{project.description}
								</p>
							)}
						</div>
						<span
							aria-hidden="true"
							className="mt-1 grid h-9 w-9 flex-none place-items-center rounded-full border border-line bg-white/[0.04] text-ink-2 transition-colors duration-[10ms] group-hover:border-line-strong group-hover:text-ink-1"
						>
							↗
						</span>
					</div>

					<div className="mt-auto flex flex-wrap gap-1.5 pt-5">
						{tech.slice(0, 4).map((techItem) => (
							<span
								key={techItem}
								className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3"
							>
								<Image src={getTechIconSrc(techItem)} alt="" height={13} width={13} className="opacity-80" />
								{techItem}
							</span>
						))}
						{tech.length > 4 && (
							<span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] tracking-[0.08em] text-ink-3">
								+{tech.length - 4}
							</span>
						)}
					</div>
				</div>
			</div>

			{showModal && (
				<ProjectModal
					project={project}
					originRect={originRect}
					returnFocusRef={cardRef}
					onClose={() => setShowModal(false)}
				/>
			)}
		</>
	);
};

export default ProjectTile;
