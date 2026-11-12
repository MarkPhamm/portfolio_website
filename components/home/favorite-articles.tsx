import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { prefersReducedMotion } from "../../utils/motion";
import { FAV_ARTICLES, IFavoriteRead, readCategoryColor } from "../../constants";
import { trackEvent, setTag } from "../../utils/clarity";
import { StatusBadge, TakeLine, SectionCount } from "./read-badges";

// Secondary articles render as vertical cards: a cover on top with the category
// pill overlaid on a gradient scrim, then title / description / meta below. The
// meta is pinned to the bottom (`mt-auto`) so cards in a row stay even. Cover
// falls back to the publication avatar (`image`). Plain <img> (not next/image)
// for the same akamai/Netlify reason as the reads cards.
const ArticleCard = ({ article }: { article: IFavoriteRead }) => {
	const cover = article.cover || article.image;

	return (
		<div className="flex flex-col h-full">
			{cover && (
				<div className="relative aspect-[16/10] overflow-hidden">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={cover}
						alt={article.title}
						className="w-full h-full object-cover transition-transform duration-[10ms] group-hover:scale-105"
						loading="lazy"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
					<div className="absolute top-3 left-3 flex items-center gap-2">
						<span
							className="text-xs font-semibold text-gray-900 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-0.5"
							style={{ backgroundColor: `${readCategoryColor(article.category)}E6` }}
						>
							{article.category}
						</span>
						<StatusBadge status={article.status} />
					</div>
				</div>
			)}
			<div className="p-5 md:p-6 flex flex-col flex-grow">
				<h4 className="font-bold text-white group-hover:text-[#BF94FF] transition-colors duration-[10ms] leading-snug text-lg md:text-xl">
					{article.title}
				</h4>
				<p className="text-sm text-gray-400 leading-relaxed mt-2 line-clamp-2">
					{article.description}
				</p>
				<TakeLine take={article.take} />
				<div className="flex items-center gap-2 mt-auto pt-4 text-xs font-medium tracking-wide text-gray-400 uppercase">
					{article.date && <span>{article.date}</span>}
					{article.date && <span aria-hidden>·</span>}
					<span>{article.author}</span>
				</div>
			</div>
		</div>
	);
};

// The lead article gets a magazine-style treatment: a large cover on one side
// and an oversized title + description on the other. The cover cell keeps a
// fixed aspect ratio at ALL breakpoints (object-cover center-crops) — never
// `md:aspect-auto md:h-full`, which let the text panel dictate height and
// clipped the artwork (see VERSION.md v3.6.6/v3.6.7).
const FeaturedArticle = ({ article }: { article: IFavoriteRead }) => {
	const cover = article.cover || article.image;

	return (
		<div className="grid md:grid-cols-2">
			{cover && (
				<div className="relative aspect-[16/10] overflow-hidden">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={cover}
						alt={article.title}
						className="w-full h-full object-cover transition-transform duration-[10ms] group-hover:scale-105"
						loading="lazy"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
				</div>
			)}
			<div className="p-6 md:p-8 flex flex-col justify-center">
				<div className="flex items-center flex-wrap gap-2 mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
					<span className="normal-case tracking-normal text-[#BF94FF] bg-[#9146FF]/15 border border-[#9146FF]/20 rounded-full px-2.5 py-0.5">
						Featured
					</span>
					<span style={{ color: readCategoryColor(article.category) }}>
						{article.category}
					</span>
					<StatusBadge status={article.status} />
				</div>
				<h4 className="font-bold text-white group-hover:text-[#BF94FF] transition-colors duration-[10ms] leading-tight text-2xl md:text-4xl">
					{article.title}
				</h4>
				<p className="text-sm md:text-base text-gray-400 leading-relaxed mt-4 line-clamp-3">
					{article.description}
				</p>
				<TakeLine take={article.take} />
				<div className="flex items-center gap-2 mt-5 text-xs font-medium tracking-wide text-gray-400 uppercase">
					{article.date && <span>{article.date}</span>}
					{article.date && <span aria-hidden>·</span>}
					<span>{article.author}</span>
				</div>
			</div>
		</div>
	);
};

const FavoriteArticles = ({
	items = FAV_ARTICLES,
	heading = "Favorite Articles",
	subheading = "Single posts that stuck with me — worth reading start to finish",
	id = "fav-articles",
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
	const rowsRef = useRef<(HTMLAnchorElement | null)[]>([]);

	// First article is the magazine-style lead; the rest fall into the list.
	const [featured, ...rest] = items;

	useEffect(() => {
		if (!sectionRef.current) return;

		// After the user touches the filter, cards re-render mid-scroll and a
		// `once` ScrollTrigger below the fold would leave them stuck invisible —
		// so we strip inline styles and skip the entrance entirely.
		if (!animate || prefersReducedMotion()) {
			rowsRef.current.forEach((el) => el && gsap.set(el, { clearProps: "all" }));
			const heading = sectionRef.current.querySelector(".section-heading");
			if (heading) gsap.set(heading, { clearProps: "all" });
			return;
		}

		const triggers: ScrollTrigger[] = [];

		rowsRef.current.forEach((el, idx) => {
			if (!el) return;
			gsap.set(el, { opacity: 0, y: 40 });

			const trigger = ScrollTrigger.create({
				trigger: el,
				start: "top 90%",
				once: true,
				onEnter: () => {
					gsap.to(el, {
						opacity: 1,
						y: 0,
						duration: 0.6,
						delay: idx * 0.1,
						ease: "power2.out",
						// Drop the inline transform on finish so the featured
						// card's CSS hover lift (-translate-y-1) isn't blocked.
						clearProps: "transform",
					});
				},
			});
			triggers.push(trigger);
		});

		const heading = sectionRef.current.querySelector(".section-heading");
		if (heading) {
			gsap.set(heading, { clipPath: "inset(0 100% 0 0)" });
			triggers.push(
				ScrollTrigger.create({
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
				})
			);
		}

		return () => {
			triggers.forEach((t) => t.kill());
		};
	}, [animate, items]);

	return (
		<section
			ref={sectionRef}
			className={`w-full relative select-none section-container ${className} flex flex-col`}
			id={id}
		>
			<div className="flex flex-col mb-8">
				<div className="flex items-end gap-3">
					<h2 className="section-heading seq">{heading}</h2>
					<SectionCount count={items.length} noun="article" />
				</div>
				<h3 className="text-2xl md:max-w-2xl w-full seq mt-2 text-gray-200">
					{subheading}
				</h3>
			</div>

			{featured && (
				<a
					ref={(el) => (rowsRef.current[0] = el)}
					href={featured.url}
					target="_blank"
					rel="noreferrer"
					data-read-card
					className="group block rounded-2xl overflow-hidden bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 transition-all duration-[10ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-[#9146FF]/40 hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)] hover:-translate-y-1"
					onClick={() => {
						trackEvent("article_click", { article_title: featured.title });
						setTag("article_domain", featured.domain);
					}}
				>
					<FeaturedArticle article={featured} />
				</a>
			)}

			{rest.length > 0 && (
				<div className="grid md:grid-cols-2 gap-6 mt-6 md:mt-8">
					{rest.map((article, index) => (
						<a
							key={index}
							ref={(el) => (rowsRef.current[index + 1] = el)}
							href={article.url}
							target="_blank"
							rel="noreferrer"
							data-read-card
							className="group block h-full rounded-2xl overflow-hidden bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 transition-all duration-[10ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-[#9146FF]/40 hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)] hover:-translate-y-1"
							onClick={() => {
								trackEvent("article_click", {
									article_title: article.title,
								});
								setTag("article_domain", article.domain);
							}}
						>
							<ArticleCard article={article} />
						</a>
					))}
				</div>
			)}
		</section>
	);
};

export default FavoriteArticles;
