import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ARTICLES, IArticle, SOCIAL_LINKS } from "../../constants";
import { trackEvent, setTag } from "../../utils/clarity";

const ArticleCard = ({
	article,
	featured = false,
}: {
	article: IArticle;
	featured?: boolean;
}) => (
	<>
		<div
			className={`relative overflow-hidden bg-gray-800 ${
				featured ? "md:h-full" : "aspect-video"
			}`}
		>
			<img
				src={article.thumbnail}
				alt={article.title}
				className="w-full h-full object-cover object-top transition-transform duration-[10ms] group-hover:scale-105"
				loading={featured ? "eager" : "lazy"}
				decoding={featured ? "sync" : "async"}
				{...(featured ? { fetchPriority: "high" } as any : {})}
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-gray-900/10" />
			<span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-gray-300 border border-white/10">
				{article.date}
			</span>
		</div>
		<div className={featured ? "p-6 md:p-8 flex flex-col justify-center" : "p-6"}>
			<div className="flex items-center gap-3 mb-3">
				<span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#9146FF]/15 text-[#BF94FF] border border-[#9146FF]/20">
					{article.tag}
				</span>
				<span className="text-xs text-gray-500">{article.readingTime}</span>
			</div>
			<h3
				className={`font-semibold text-white group-hover:text-[#BF94FF] transition-colors duration-[10ms] leading-snug ${
					featured ? "text-lg md:text-xl mb-3" : "text-base mb-3"
				}`}
			>
				{article.title}
			</h3>
			<p
				className={`text-sm text-gray-500 leading-relaxed ${
					featured ? "line-clamp-4" : "line-clamp-3"
				}`}
			>
				{article.excerpt}
			</p>
		</div>
	</>
);

const ArticlesPreview = () => {
	const sectionRef = useRef<HTMLElement>(null);
	const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

	useEffect(() => {
		if (!sectionRef.current) return;

		const triggers: ScrollTrigger[] = [];

		cardsRef.current.forEach((el, idx) => {
			if (!el) return;
			gsap.set(el, { opacity: 0, y: 50, scale: 0.96 });

			const trigger = ScrollTrigger.create({
				trigger: el,
				start: "top 85%",
				onEnter: () => {
					gsap.to(el, {
						opacity: 1,
						y: 0,
						scale: 1,
						duration: 0.7,
						delay: idx * 0.12,
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
	}, []);

	const [featured, ...rest] = ARTICLES;

	return (
		<section
			ref={sectionRef}
			className="w-full relative select-none section-container py-8 md:py-12 flex flex-col"
			id="articles"
		>
			<div className="flex flex-col mb-10">
				<h1 className="section-heading seq">Articles</h1>
				<h2 className="text-2xl md:max-w-2xl w-full seq mt-2 text-gray-200">
					Analytics, data engineering, and the unglamorous truths from
					working in data
				</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Featured card — spans full width with horizontal layout */}
				<a
					ref={(el) => (cardsRef.current[0] = el)}
					href={featured.url}
					target="_blank"
					rel="noreferrer"
					className="group block md:col-span-2 rounded-2xl overflow-hidden bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 transition-all duration-[10ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-[#9146FF]/40 hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)] hover:-translate-y-2 md:grid md:grid-cols-2"
					onClick={() => { trackEvent("article_click"); setTag("article_title", featured.title); }}
				>
					<ArticleCard article={featured} featured />
				</a>

				{/* Remaining cards */}
				{rest.map((article, index) => (
					<a
						key={index + 1}
						ref={(el) => (cardsRef.current[index + 1] = el)}
						href={article.url}
						target="_blank"
						rel="noreferrer"
						className="group block rounded-2xl overflow-hidden bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 transition-all duration-[10ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-[#9146FF]/40 hover:shadow-[0_20px_40px_-12px_rgba(145,70,255,0.15)] hover:-translate-y-2"
						onClick={() => { trackEvent("article_click"); setTag("article_title", article.title); }}
					>
						<ArticleCard article={article} />
					</a>
				))}
			</div>

			<div className="mt-12 flex justify-center">
				<a
					href={SOCIAL_LINKS.substack}
					target="_blank"
					rel="noreferrer"
					className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#9146FF]/50 text-[#BF94FF] hover:bg-[#9146FF]/10 hover:border-[#9146FF] transition-all duration-[10ms] text-sm font-medium"
					onClick={() => trackEvent("substack_click")}
				>
					Read more on Substack
					<svg
						className="w-4 h-4 transition-transform duration-[10ms] group-hover:translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</section>
	);
};

export default ArticlesPreview;
