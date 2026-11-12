import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { prefersReducedMotion } from "../../utils/motion";
import { FAVORITE_READS, IFavoriteRead } from "../../constants";
import { trackEvent, setTag } from "../../utils/clarity";
import { StatusBadge, TakeLine, CategoryPill, SectionCount } from "./read-badges";

// Grid stays scannable as the list grows: show 6, tuck the rest behind an
// expander. With exactly 6 items today the button simply never renders.
const VISIBLE_LIMIT = 6;

// Plain <img> favicon with a monogram fallback. We intentionally do NOT use
// next/image here: the akamai loader (next.config.js → path:'/') mangles remote
// URLs and Netlify has no /_next/image endpoint, so a raw <img> to Google's
// favicon service is the reliable path. If it 404s/blocks, we swap to a colored
// monogram so the two generic-substack.com entries still read distinctly.
const ReadFavicon = ({ read }: { read: IFavoriteRead }) => {
	const [failed, setFailed] = useState(false);
	const initial = read.title.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase();

	// A local avatar (in /public) takes priority over the remote favicon and
	// fills the whole tile, since these are photo/logo crops rather than icons.
	if (read.image) {
		return (
			<div className="flex-none w-11 h-11 rounded-xl border border-white/10 overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={read.image}
					alt={`${read.title} logo`}
					className="w-full h-full object-cover"
					loading="lazy"
				/>
			</div>
		);
	}

	if (failed) {
		return (
			<div className="flex-none w-11 h-11 rounded-xl bg-[#9146FF]/15 border border-[#9146FF]/20 flex items-center justify-center text-[#BF94FF] font-semibold text-lg">
				{initial}
			</div>
		);
	}

	return (
		<div className="flex-none w-11 h-11 rounded-xl bg-white/95 border border-white/10 flex items-center justify-center overflow-hidden p-1">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={`https://www.google.com/s2/favicons?domain=${read.domain}&sz=128`}
				alt={`${read.title} favicon`}
				className="w-full h-full object-contain"
				loading="lazy"
				onError={() => setFailed(true)}
			/>
		</div>
	);
};

const ReadCard = ({ read }: { read: IFavoriteRead }) => (
	<div className="p-6 flex flex-col h-full">
		<div className="flex items-center gap-4 mb-4">
			<ReadFavicon read={read} />
			<div className="min-w-0">
				<h4 className="font-semibold text-white group-hover:text-[#BF94FF] transition-colors duration-[10ms] leading-snug text-base truncate">
					{read.title}
				</h4>
				<p className="text-sm text-gray-400 truncate">by {read.author}</p>
			</div>
		</div>
		{read.status && (
			<div className="mb-3 -mt-1">
				<StatusBadge status={read.status} />
			</div>
		)}
		<div className="flex-grow">
			<p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
				{read.description}
			</p>
			<TakeLine take={read.take} />
		</div>
		<div className="flex items-center justify-between gap-3 mt-5">
			<span className="text-xs text-gray-400 truncate">{read.domain}</span>
			<CategoryPill category={read.category} />
		</div>
	</div>
);

const FavoriteReads = ({
	items = FAVORITE_READS,
	heading = "Favorite Reads",
	subheading = "The blogs and newsletters I actually read — from data engineering to music to the gloriously unconventional",
	id = "reads",
	className = "py-8 md:py-12",
	animate = true,
}: {
	items?: IFavoriteRead[];
	heading?: string;
	subheading?: string;
	id?: string;
	className?: string;
	animate?: boolean;
}) => {
	const sectionRef = useRef<HTMLElement>(null);
	const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
	const [expanded, setExpanded] = useState(false);

	const visible = expanded ? items : items.slice(0, VISIBLE_LIMIT);
	const hidden = items.length - visible.length;

	useEffect(() => {
		if (!sectionRef.current) return;

		// After the user touches the filter, cards re-render mid-scroll and a
		// `once` ScrollTrigger below the fold would leave them stuck invisible —
		// so we strip inline styles and skip the entrance entirely.
		if (!animate || prefersReducedMotion()) {
			cardsRef.current.forEach((el) => el && gsap.set(el, { clearProps: "all" }));
			const heading = sectionRef.current.querySelector(".section-heading");
			if (heading) gsap.set(heading, { clearProps: "all" });
			return;
		}

		const triggers: ScrollTrigger[] = [];

		cardsRef.current.forEach((el, idx) => {
			if (!el) return;
			gsap.set(el, { opacity: 0, y: 50, scale: 0.96 });

			const trigger = ScrollTrigger.create({
				trigger: el,
				start: "top 90%",
				onEnter: () => {
					gsap.to(el, {
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 0.7,
						delay: idx * 0.1,
						ease: "back.out(1.2)",
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
	}, [animate, visible.length]);

	return (
		<section
			ref={sectionRef}
			className={`w-full relative select-none section-container ${className} flex flex-col`}
			id={id}
		>
			<div className="flex flex-col mb-10">
				<div className="flex items-end gap-3">
					<h2 className="section-heading seq">{heading}</h2>
					<SectionCount count={items.length} noun="blog" />
				</div>
				<h3 className="text-2xl md:max-w-2xl w-full seq mt-2 text-gray-200">
					{subheading}
				</h3>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{visible.map((read, index) => (
					<a
						key={read.title}
						ref={(el) => (cardsRef.current[index] = el)}
						href={read.url}
						target="_blank"
						rel="noreferrer"
						data-read-card
						className="group block rounded-2xl overflow-hidden bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 transition-all duration-[10ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-[#9146FF]/40 hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)] hover:-translate-y-2"
						onClick={() => {
							trackEvent("read_click", { read_title: read.title });
							setTag("read_domain", read.domain);
						}}
					>
						<ReadCard read={read} />
					</a>
				))}
			</div>

			{hidden > 0 && (
				<button
					type="button"
					onClick={() => setExpanded(true)}
					className="self-center mt-8 text-sm font-medium px-5 py-2 rounded-full border border-[#9146FF]/30 text-[#BF94FF] hover:border-[#9146FF]/60 hover:bg-[#9146FF]/10 transition-all duration-[10ms]"
				>
					Show all {items.length} →
				</button>
			)}
		</section>
	);
};

export default FavoriteReads;
