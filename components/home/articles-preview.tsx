import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { ARTICLES, IArticle, SOCIAL_LINKS } from "../../constants";
import { trackEvent, setTag } from "../../utils/clarity";
import { clipReveal, revealUp } from "../../utils/motion";
import SectionHeader from "../common/section-header";

const ArticleCard = ({
	article,
	featured = false,
}: {
	article: IArticle;
	featured?: boolean;
}) => (
	<>
		<div
			className={`article-frame relative overflow-hidden rounded-[20px] border border-line bg-surface-2 transition-colors duration-[10ms] group-hover:border-line-strong ${
				featured ? "aspect-[5/4]" : "aspect-video"
			}`}
		>
			<div className="article-img absolute inset-0">
				<Image
					src={article.thumbnail}
					alt={article.title}
					layout="fill"
					objectFit="cover"
					objectPosition="top"
					className="transition-transform duration-[10ms] group-hover:scale-[1.03]"
					sizes={featured ? "(max-width: 768px) 92vw, 50vw" : "(max-width: 768px) 92vw, 33vw"}
					loading="lazy"
				/>
			</div>
			<div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
			<span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-1 backdrop-blur-md">
				{article.date}
			</span>
		</div>
		<div className={`article-text ${featured ? "mt-6 md:mt-0 flex flex-col justify-center" : "mt-5"}`}>
			<p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
				<span className="text-accent-soft">{article.tag}</span>
				<span className="mx-2 text-ink-3">·</span>
				{article.readingTime}
			</p>
			<h3
				className={`font-normal tracking-[-0.02em] text-ink-1 transition-colors duration-[10ms] group-hover:text-accent-soft ${
					featured ? "mb-4 text-2xl leading-tight md:text-[2rem]" : "mb-3 text-xl leading-snug"
				}`}
			>
				{article.title}
			</h3>
			<p
				className={`text-[15px] leading-relaxed text-ink-2 ${
					featured ? "line-clamp-4 md:max-w-md" : "line-clamp-3"
				}`}
			>
				{article.excerpt}
			</p>
		</div>
	</>
);

const ArticlesPreview = () => {
	const sectionRef = useRef<HTMLElement>(null);

	// Frames open from an inset clip as they scroll in; the text follows.
	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;
		const cleanups = Array.from(section.querySelectorAll<HTMLElement>(".article-frame")).map(
			(frame) => clipReveal(frame, frame.querySelector<HTMLElement>(".article-img"), { radius: 20 })
		);
		cleanups.push(revealUp(section.querySelectorAll(".article-text"), { y: 20 }));
		return () => cleanups.forEach((fn) => fn());
	}, []);

	const [featured, ...rest] = ARTICLES;

	const substackLink = (
		<a
			href={SOCIAL_LINKS.substack}
			target="_blank"
			rel="noreferrer"
			className="btn-pill btn-glass"
			onClick={() => trackEvent("substack_click")}
		>
			Read more on Substack
			<span className="btn-disc" aria-hidden="true">
				↗
			</span>
		</a>
	);

	return (
		<section
			ref={sectionRef}
			className="w-full relative select-none section-container py-24 md:py-36 flex flex-col"
			id="articles"
		>
			<SectionHeader
				index="05"
				eyebrow="Articles"
				title="Articles"
				tagline="Analytics, data engineering, and the unglamorous truths from working in data"
				aside={substackLink}
				className="mb-12 md:mb-16"
			/>

			<div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
				{/* Featured card — spans full width with horizontal layout */}
				<a
					href={featured.url}
					target="_blank"
					rel="noreferrer"
					data-cursor-label="Read"
					className="group block md:col-span-2 md:grid md:grid-cols-2 md:items-center md:gap-12"
					onClick={() => { trackEvent("article_click"); setTag("article_title", featured.title); }}
				>
					<ArticleCard article={featured} featured />
				</a>

				{/* Remaining cards */}
				{rest.map((article, index) => (
					<a
						key={index + 1}
						href={article.url}
						target="_blank"
						rel="noreferrer"
						data-cursor-label="Read"
						className="group block"
						onClick={() => { trackEvent("article_click"); setTag("article_title", article.title); }}
					>
						<ArticleCard article={article} />
					</a>
				))}
			</div>
		</section>
	);
};

export default ArticlesPreview;
