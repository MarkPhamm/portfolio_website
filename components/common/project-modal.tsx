import React, { useEffect, useRef } from "react";
// @ts-ignore — no @types/react-dom in this repo (same as skills.tsx)
import ReactDOM from "react-dom";
import Image from "next/image";
import { IProject, getTechIconSrc, getTechUrl } from "../../constants";
import { gsap } from "gsap";
import { trackEvent, setTag } from "../../utils/clarity";
import { prefersReducedMotion } from "../../utils/motion";
import { lockScroll, unlockScroll } from "../../utils/scroll";

interface ProjectModalProps {
	project: IProject;
	onClose: () => void;
	/** Viewport rect of the clicked card's frame — the modal zooms out of it. */
	originRect?: DOMRect | null;
	/** Focus goes back here on close (the card that opened it). */
	returnFocusRef?: React.RefObject<HTMLElement>;
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

/**
 * Project details. Portaled to <body>: the card lives inside the Works reel's
 * transformed track, which would otherwise become the containing block for
 * this fixed overlay (and trap its z-index under the header).
 */
const ProjectModal = ({ project, onClose, originRect, returnFocusRef }: ProjectModalProps) => {
	const overlayRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	// x/y/scale deltas from the modal's resting place back to the clicked card,
	// measured once on mount (scroll is locked, so viewport rects hold).
	const zoomDeltas = useRef<{ x: number; y: number; scaleX: number; scaleY: number } | null>(null);
	const closingRef = useRef(false);

	const handleClose = () => {
		if (closingRef.current) return;
		closingRef.current = true;
		const done = () => {
			onClose();
			returnFocusRef?.current?.focus();
		};
		if (overlayRef.current && cardRef.current) {
			gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
			if (zoomDeltas.current) {
				// Shrink back toward the card it came from.
				gsap.to(cardRef.current.children, { opacity: 0, duration: 0.12 });
				gsap.to(cardRef.current, {
					...zoomDeltas.current,
					opacity: 0,
					duration: 0.24,
					ease: "power2.in",
					onComplete: done,
				});
			} else {
				gsap.to(cardRef.current, {
					opacity: 0,
					scale: 0.96,
					y: 10,
					duration: 0.2,
					onComplete: done,
				});
			}
		} else {
			done();
		}
	};

	// Escape always reaches the latest handler.
	const handleCloseRef = useRef(handleClose);
	handleCloseRef.current = handleClose;

	useEffect(() => {
		lockScroll();

		if (overlayRef.current && cardRef.current) {
			gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });

			const card = cardRef.current;
			if (originRect && !prefersReducedMotion()) {
				const final = card.getBoundingClientRect();
				zoomDeltas.current = {
					x: originRect.left + originRect.width / 2 - (final.left + final.width / 2),
					y: originRect.top + originRect.height / 2 - (final.top + final.height / 2),
					scaleX: originRect.width / final.width,
					scaleY: originRect.height / final.height,
				};
				// Grow the card out of the tile; the content fades in slightly
				// late to mask the non-uniform stretch.
				gsap.fromTo(
					card,
					{ ...zoomDeltas.current, opacity: 0.4, transformOrigin: "center center" },
					{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.5, ease: "power4.out" }
				);
				gsap.fromTo(card.children, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.15 });
			} else {
				gsap.fromTo(
					card,
					{ opacity: 0, scale: 0.96, y: 20 },
					{ opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
				);
			}
		}
		closeRef.current?.focus({ preventScroll: true });

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleCloseRef.current();
		};
		window.addEventListener("keydown", handleEscape);

		return () => {
			unlockScroll();
			window.removeEventListener("keydown", handleEscape);
		};
		// Mount-only: originRect is captured at open time.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [stop1, stop2] = project.gradient;
	const description = project.fullDescription || project.description;

	const modal = (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8"
			role="dialog"
			aria-modal="true"
			aria-label={project.name}
			onClick={(e) => {
				if (e.target === e.currentTarget) handleClose();
			}}
		>
			<div className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-md" />

			<div
				ref={cardRef}
				data-lenis-prevent
				className="scrollbar-none relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-line-strong bg-surface-1 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
			>
				<button
					ref={closeRef}
					onClick={handleClose}
					className="glass absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full text-ink-2 transition-colors duration-[10ms] hover:text-ink-1"
					aria-label="Close project details"
				>
					<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div className="relative aspect-[16/9] overflow-hidden rounded-t-[28px]">
					<div
						className="absolute inset-0 z-10"
						style={{ background: `linear-gradient(150deg, ${stop1}33 0%, transparent 45%, ${stop2}40 100%)` }}
					/>
					<Image src={project.image} alt={project.name} layout="fill" objectFit="cover" />
					<div className="absolute bottom-0 left-0 right-0 z-10 h-28 bg-gradient-to-t from-surface-1 to-transparent" />
				</div>

				<div className="relative z-20 -mt-6 p-6 md:p-9">
					<span className="eyebrow mb-4">{getCategoryLabel(project.category)}</span>

					<h2 className="mb-4 mt-4 text-3xl font-light tracking-[-0.03em] text-ink-1 md:text-4xl">{project.name}</h2>

					<p className="mb-8 leading-relaxed text-ink-2">{description}</p>

					{project.impact && project.impact.length > 0 && (
						<div className="mb-8">
							<h3 className="mono-label mb-3">Key highlights</h3>
							<div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
								{project.impact.map((item, i) => (
									<div key={i} className="bg-surface-1 px-4 py-4 text-sm text-ink-1">
										{item}
									</div>
								))}
							</div>
						</div>
					)}

					<div className="mb-8">
						<h3 className="mono-label mb-3">Tech stack</h3>
						<div className="flex flex-wrap gap-2">
							{project.tech.map((techItem) => {
								const url = getTechUrl(techItem);
								const chipClass =
									"inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink-2";
								const content = (
									<>
										<Image src={getTechIconSrc(techItem)} alt="" height={16} width={16} className="opacity-80" />
										<span>{techItem}</span>
									</>
								);
								// Real products link to their official site; concept-only
								// tech (SSH, TCP/IP, DNS, …) renders as a plain chip.
								return url ? (
									<a
										key={techItem}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${techItem} — opens in new tab`}
										className={`${chipClass} transition-colors duration-[10ms] hover:border-line-strong hover:text-ink-1`}
									>
										{content}
									</a>
								) : (
									<div key={techItem} className={chipClass}>
										{content}
									</div>
								);
							})}
						</div>
					</div>

					{project.url && (
						<a
							href={project.url}
							target="_blank"
							rel="noreferrer"
							className="btn-pill btn-primary"
							onClick={() => { trackEvent("project_view_external"); setTag("project_name", project.name); }}
						>
							View project
							<span className="btn-disc" aria-hidden="true">
								↗
							</span>
						</a>
					)}
				</div>
			</div>
		</div>
	);

	return ReactDOM.createPortal(modal, document.body);
};

export default ProjectModal;
