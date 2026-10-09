import React, { useEffect, useRef } from "react";
import { revealUp } from "../../utils/motion";
import { revealLines, scrambleIn } from "../../utils/motion-text";

type SectionHeaderProps = {
	/** Chapter number, e.g. "04". */
	index: string;
	/** Mono eyebrow label (reuse the nav name). */
	eyebrow: string;
	title: React.ReactNode;
	/** Rendered inline as the dim second tone of the headline. Keep it short. */
	inlineTagline?: React.ReactNode;
	/** Rendered as a paragraph under the headline. */
	tagline?: React.ReactNode;
	/** Right-hand slot (links, filters) on wide screens. */
	aside?: React.ReactNode;
	align?: "left" | "center";
	className?: string;
};

/**
 * Chapter header used by every homepage section: the eyebrow decodes in,
 * the headline's lines rise out of their own masks, the tagline follows.
 * Keeps the `section-heading` class so older helpers/queries still match.
 * Only imported by lazily loaded sections (SplitText stays out of _app).
 */
const SectionHeader = ({
	index,
	eyebrow,
	title,
	inlineTagline,
	tagline,
	aside,
	align = "left",
	className = "",
}: SectionHeaderProps) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const labelRef = useRef<HTMLSpanElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const taglineRef = useRef<HTMLParagraphElement>(null);
	const asideRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		const cleanups = [
			scrambleIn(labelRef.current, { trigger: root }),
			revealLines(titleRef.current, { trigger: root }),
			revealUp([taglineRef.current, asideRef.current].filter(Boolean) as HTMLElement[], {
				start: "top 90%",
			}),
		];
		return () => cleanups.forEach((fn) => fn());
	}, []);

	const centered = align === "center";

	return (
		<div
			ref={rootRef}
			className={`flex flex-col gap-8 ${
				centered ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between"
			} ${className}`}
		>
			<div className={`flex flex-col ${centered ? "items-center" : "items-start"}`}>
				<span className="eyebrow mb-6">
					<span className="eyebrow-index">{index}</span>
					<span aria-hidden="true" className="h-3 w-px bg-white/[0.16]" />
					<span ref={labelRef}>{eyebrow}</span>
				</span>
				<h2 ref={titleRef} className={`section-heading max-w-5xl ${centered ? "mx-auto" : ""}`}>
					{title}
					{inlineTagline && <span className="t2">, {inlineTagline}</span>}
				</h2>
				{tagline && (
					<p
						ref={taglineRef}
						className={`mt-6 max-w-2xl text-lg leading-relaxed text-ink-2 ${centered ? "mx-auto" : ""}`}
					>
						{tagline}
					</p>
				)}
			</div>
			{aside && (
				<div ref={asideRef} className="shrink-0">
					{aside}
				</div>
			)}
		</div>
	);
};

export default SectionHeader;
