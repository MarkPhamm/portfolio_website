// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { MENULINKS, SKILLS } from "../../constants";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { gsap, Linear } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import { trackEvent } from "../../utils/clarity";

const trackArticleClick = (slug: string, target: "title" | "image") =>
	trackEvent("internal_article_click", { slug, target });

const SKILL_STYLES = {
	SECTION:
		"w-full relative select-none mb-12 section-container py-8 md:py-12 flex flex-col justify-center",
	SKILL_TITLE: "section-title-sm mb-4 seq",
};

const ArticleSection = () => {
	const targetSection = useRef<HTMLDivElement>(null);
	const [willChange, setwillChange] = useState(false);

	const initRevealAnimation = (
		targetSection: React.RefObject<HTMLDivElement | null>
	): ScrollTrigger => {
		if (!targetSection.current) return ScrollTrigger.create({});
		const revealTl = gsap.timeline({ defaults: { ease: Linear.easeNone } });
		revealTl.from(
			targetSection.current.querySelectorAll(".seq"),
			{ opacity: 0, duration: 0.5, stagger: 0.5 },
			"<"
		);

		return ScrollTrigger.create({
			trigger: targetSection.current.querySelector(".skills-wrapper"),
			start: "100px bottom",
			end: `center center`,
			animation: revealTl,
			scrub: 0,
			onToggle: (self) => setwillChange(self.isActive),
		});
	};

	useEffect(() => {
		const revealAnimationRef = initRevealAnimation(targetSection);

		return revealAnimationRef.kill;
	}, [targetSection]);

	const renderSectionTitle = (): React.ReactNode => (
		<div className="flex flex-col">
			<p className="section-title-sm seq">Articles</p>
			<h1 className="section-heading seq mt-2">My articles</h1>
			<h2 className="text-2xl md:max-w-2xl w-full seq mt-2">
				Check out my newest blogs!{" "}
			</h2>
			<div className=" seq mt-2" style={{ width: "70%" }}>
				<p className="text-base md:text-lg">
					Unlock the world of SQL with my insightful and practical blogs. Dive
					into comprehensive guides, tips, and best practices that simplify
					complex concepts and empower you to harness the full potential of SQL
					in your data journey.
				</p>
			</div>
		</div>
	);

	return (
		<section className="relative">
			<div
				className={SKILL_STYLES.SECTION}
				id={MENULINKS[2].ref}
				ref={targetSection}
			>
				<div className="flex flex-col skills-wrapper">
					{renderSectionTitle()}
					<div className="grid grid-cols-1 pt-10 gap-4">
						<div className="col-span-1">
							<div className="grid grid-cols-7">
								<div className="col-span-3 seq">
									<div>
										<Link href="/myarticle/retention" passHref>
											<a onClick={() => trackArticleClick("retention", "title")}>
												<h3 className="article-title-sm mb-4 seq">
													First Day Retention Rate
												</h3>
											</a>
										</Link>
										<p className="article-text-sm seq">
											Calculate the first-day retention rate of video game
											players
										</p>
										<p className="article-min-read seq text-right">
											8 mins read
										</p>
									</div>
								</div>
								<div className="col-start-4 col-span-2 hidden lg:grid m-auto seq">
									<Link href="/myarticle/retention" passHref>
										<a onClick={() => trackArticleClick("retention", "image")}>
											<Image
												src="/article/firstday.jpg"
												alt="React"
												width={300}
												height={170}
												className="img-cus"
											/>
										</a>
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 pt-10 gap-4 mt-5">
						<div className="col-span-1">
							<div className="grid grid-cols-7">
								<div className="col-start-2 col-span-3 seq">
									<div>
										<Link href="/myarticle/marketcamp" passHref>
											<a onClick={() => trackArticleClick("marketcamp", "title")}>
												<h3 className="article-title-sm mb-4 seq">
													Marketing Campaign Success
												</h3>
											</a>
										</Link>
										<p className="article-text-sm seq">
											Find the number of users that made additional in-app
											purchases after their first purchase and exposure to the
											marketing campaign
										</p>
										<p className="article-min-read seq text-right">
											10 mins read
										</p>
									</div>
								</div>
								<div className="col-start-5 col-span-2 hidden lg:grid m-auto seq">
									<Link href="/myarticle/marketcamp" passHref>
										<a onClick={() => trackArticleClick("marketcamp", "image")}>
											<Image
												src="/article/marketing.jpg"
												alt="React"
												width={300}
												height={170}
												className="img-cus"
											/>
										</a>
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 pt-10 gap-4 mt-5">
						<div className="col-span-1">
							<div className="grid grid-cols-7">
								<div className="col-span-3 seq">
									<div>
										<Link href="/myarticle/userstreak" passHref>
											<a onClick={() => trackArticleClick("userstreak", "title")}>
												<h3 className="article-title-sm mb-4 seq">
													User Streaks (Classis Gaps and Islands)
												</h3>
											</a>
										</Link>
										<p className="article-text-sm seq">
											Find the top 3 users with the longest continuous streak of
											visiting the platform as of August 10, 2022
										</p>
										<p className="article-min-read seq text-right">
											12 mins read
										</p>
									</div>
								</div>
								<div className="col-start-4 col-span-2 hidden lg:grid m-auto seq">
									<Link href="/myarticle/userstreak" passHref>
										<a onClick={() => trackArticleClick("userstreak", "image")}>
											<Image
												src="/article/streak.jpg"
												alt="React"
												width={300}
												height={170}
												className="img-cus"
											/>
										</a>
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 pt-10 gap-4 mt-5">
						<div className="col-span-1">
							<div className="grid grid-cols-7">
								<div className="col-start-2 col-span-3 seq">
									<div>
										<Link href="/myarticle/time" passHref>
											<a onClick={() => trackArticleClick("time", "title")}>
												<h3 className="article-title-sm mb-4 seq">
													Time Between Two Events
												</h3>
											</a>
										</Link>
										<p className="article-text-sm seq">
											Find the Facebook's user with the least time between page
											load and first scroll
										</p>
										<p className="article-min-read seq text-right">
											5 mins read
										</p>
									</div>
								</div>
								<div className="col-start-5 col-span-2 hidden lg:grid m-auto seq">
									<Link href="/myarticle/time" passHref>
										<a onClick={() => trackArticleClick("time", "image")}>
											<Image
												src="/article/time.jpg"
												alt="React"
												width={300}
												height={170}
												className="img-cus"
											/>
										</a>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ArticleSection;
