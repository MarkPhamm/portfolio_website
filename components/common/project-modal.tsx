import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { IProject } from "../../constants";
import { gsap } from "gsap";
import { trackEvent, setTag } from "../../utils/clarity";

interface ProjectModalProps {
	project: IProject;
	onClose: () => void;
}

const getCategoryLabel = (category: string): string => {
	const labels: Record<string, string> = {
		"End-to-End Data Analytics": "Data Pipeline",
		"BI - Dashboard - Visualization": "BI & Dashboard",
		"Statistics - ML - AI Project": "ML & Statistics",
		"Cloud - Infrastructure": "Cloud & Infra",
		"Learning": "Learning",
	};
	return labels[category] || category;
};

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
	const overlayRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.body.style.overflow = "hidden";

		if (overlayRef.current && cardRef.current) {
			gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
			gsap.fromTo(
				cardRef.current,
				{ opacity: 0, scale: 0.95, y: 20 },
				{ opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
			);
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleClose();
		};
		window.addEventListener("keydown", handleEscape);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleEscape);
		};
	}, []);

	const handleClose = () => {
		if (overlayRef.current && cardRef.current) {
			gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
			gsap.to(cardRef.current, {
				opacity: 0, scale: 0.95, y: 10, duration: 0.2,
				onComplete: onClose,
			});
		} else {
			onClose();
		}
	};

	const [stop1, stop2] = project.gradient;
	const description = project.fullDescription || project.description;

	const modal = (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
			onClick={(e) => {
				if (e.target === e.currentTarget) handleClose();
			}}
		>
			<div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none" />

			<div
				ref={cardRef}
				className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-none rounded-2xl bg-gray-900 border border-gray-700/50 shadow-2xl"
			>
				{/* Close button */}
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white transition-colors"
					aria-label="Close modal"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Hero image */}
				<div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
					<div
						className="absolute inset-0 opacity-50 z-10"
						style={{
							background: `linear-gradient(135deg, ${stop1}90 0%, ${stop2}90 100%)`,
						}}
					/>
					<Image
						src={project.image}
						alt={project.name}
						layout="fill"
						objectFit="cover"
					/>
					<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent z-10" />
				</div>

				{/* Content */}
				<div className="p-6 md:p-8 -mt-8 relative z-20">
					{/* Category */}
					<span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#9146FF]/20 text-[#BF94FF] mb-3">
						{getCategoryLabel(project.category)}
					</span>

					<h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
						{project.name}
					</h2>

					<p className="text-gray-300 leading-relaxed mb-6">
						{description}
					</p>

					{/* Impact metrics */}
					{project.impact && project.impact.length > 0 && (
						<div className="mb-6">
							<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
								Key Highlights
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{project.impact.map((item, i) => (
									<div
										key={i}
										className="px-4 py-3 rounded-xl bg-gray-800/80 border border-gray-700/50 text-center"
									>
										<span className="text-sm text-gray-200 font-medium">{item}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Tech stack */}
					<div className="mb-6">
						<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
							Tech Stack
						</h3>
						<div className="flex flex-wrap gap-2">
							{project.tech.map((techItem) => (
								<div
									key={techItem}
									className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50"
								>
									<Image
										src={`/projects/tech/${techItem}.${["S3", "EC2", "Lambda", "MWAA", "Terraform", "Dagster", "Flink", "Apache Iceberg", "MinIO", "Spark", "Trino", "ClickHouse", "FastAPI", "VPC"].includes(techItem) ? "webp" : "svg"}`}
										alt={techItem}
										height={18}
										width={18}
										className="opacity-80"
									/>
									<span className="text-sm text-gray-300">{techItem}</span>
								</div>
							))}
						</div>
					</div>

					{/* CTA button */}
					{project.url && (
						<a
							href={project.url}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-6 py-3 bg-[#9146FF] hover:bg-[#7B3FD9] text-white font-medium rounded-full transition-all duration-[10ms] hover:shadow-lg hover:shadow-[#9146FF]/25"
							onClick={() => { trackEvent("project_view_external"); setTag("project_name", project.name); }}
						>
							View Project
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a>
					)}
				</div>
			</div>
		</div>
	);

	return modal;
};

export default ProjectModal;
