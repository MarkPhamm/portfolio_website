// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { EMAIL, MENULINKS, SOCIAL_LINKS, TYPED_STRINGS } from "../../constants";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Typed from "typed.js";
import Image from "next/image";
import { gsap, Linear } from "gsap";
import dynamic from "next/dynamic";
import Link from "next/link";
import Button, { ButtonTypes } from "../common/button";
import HeroAurora from "./hero-aurora";
import { isSmallScreen } from "pages";
import { trackEvent, setTag, upgradeSession } from "../../utils/clarity";

const HeroImage = dynamic(() => import("./hero-image"), { ssr: false });

const firebaseConfig = {
	apiKey: "AIzaSyC7Bd9cOnlhZFTrxMZVbVzaRa9opnSnc4k",
	authDomain: "bminh-porfolio-view-counter.firebaseapp.com",
	projectId: "bminh-porfolio-view-counter",
	storageBucket: "bminh-porfolio-view-counter.firebasestorage.app",
	messagingSenderId: "352556857178",
	appId: "1:352556857178:web:e0671a9649fa0cbd4c6563",
	measurementId: "G-6T2HTBS4WQ",
};

const VIEW_COUNT_CACHE_KEY = "portfolio_view_count";

const getCachedViewCount = (): number | null => {
	if (typeof window === "undefined") return null;
	const cached = localStorage.getItem(VIEW_COUNT_CACHE_KEY);
	return cached ? parseInt(cached, 10) : null;
};

const setCachedViewCount = (count: number): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem(VIEW_COUNT_CACHE_KEY, count.toString());
};

interface IpInfo {
	ip: string;
	country: string;
	city: string;
}

const countview = async (
	setViewCount: React.Dispatch<React.SetStateAction<number | null>>
): Promise<void> => {
	try {
		const [{ initializeApp, getApps }, firestore] = await Promise.all([
			import("firebase/app"),
			import("firebase/firestore"),
		]);
		const { getFirestore, doc, getDoc, setDoc, collection, getDocs } = firestore;
		const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
		const db = getFirestore(app);

		const ipinfo: IpInfo = await fetch("https://api.ipify.org?format=json", {
			method: "GET",
		}).then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		});
		const { ip: userIp } = ipinfo;
		const userIpString = userIp.replace(/\./g, "x");

		const viewsDocRef = doc(db, "views", userIpString);
		const docSnap = await getDoc(viewsDocRef);

		if (!docSnap.exists()) {
			await setDoc(viewsDocRef, { ip: userIp });
		}

		const viewsCollectionRef = collection(db, "views");
		const viewsSnapshot = await getDocs(viewsCollectionRef);
		setViewCount(viewsSnapshot.size);
		setCachedViewCount(viewsSnapshot.size);
	} catch {
		// Silently fail — cached count is shown as fallback
	}
};

const HERO_STYLES = {
	SECTION:
		"w-full flex md:items-center py-8 section-container min-h-[85vh] md:min-h-screen relative mb-6 md:mb-12",
	CONTENT: "font-medium flex flex-col pt-20 sm:pt-24 md:pt-0 select-none relative z-10",
	SOCIAL_LINK: "link hover:opacity-90 hover:scale-110 transition-all duration-[10ms] md:mr-4 mr-2",
	BG_WRAPPER:
		"absolute hero-bg right-0 md:bottom-0 bottom-8 -z-1 md:w-3/4 w-full scale-125 sm:scale-100 flex items-end",
	TYPED_SPAN: "text-xl sm:text-2xl md:text-3xl seq",
};

const HeroSection = React.memo(() => {
	const [viewCount, setViewCount] = useState<number | null>(null);

	useEffect(() => {
		// Load cached count immediately for instant display
		const cached = getCachedViewCount();
		if (cached !== null) {
			setViewCount(cached);
		}
		// Then fetch the real count
		countview(setViewCount);
	}, []);

	const typedSpanElement = useRef<HTMLSpanElement>(null);
	const targetSection = useRef<HTMLDivElement>(null);
	const auroraRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const bgWrapperRef = useRef<HTMLDivElement>(null);

	// Mouse-reactive parallax for hero layers — rAF-throttled so we do at most
	// one batch of GSAP updates per frame regardless of pointer rate.
	useEffect(() => {
		if (isSmallScreen()) return;
		const section = targetSection.current;
		if (!section) return;

		let nx = 0;
		let ny = 0;
		let rafScheduled = false;

		const tick = () => {
			rafScheduled = false;
			if (auroraRef.current) {
				gsap.to(auroraRef.current, { x: nx * 20, y: ny * 20, duration: 1.2, ease: "power2.out", overwrite: true });
			}
			if (contentRef.current) {
				gsap.to(contentRef.current, { x: nx * -4, y: ny * -4, duration: 1, ease: "power2.out", overwrite: true });
			}
			if (bgWrapperRef.current) {
				gsap.to(bgWrapperRef.current, { x: nx * -8, y: ny * -6, duration: 1, ease: "power2.out", overwrite: true });
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			const rect = section.getBoundingClientRect();
			nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
			ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
			if (!rafScheduled) {
				rafScheduled = true;
				requestAnimationFrame(tick);
			}
		};

		section.addEventListener("mousemove", handleMouseMove, { passive: true });
		return () => section.removeEventListener("mousemove", handleMouseMove);
	}, []);

	const initTypeAnimation = (
		typedSpanElement: React.RefObject<HTMLSpanElement | null>
	): Typed => {
		if (!typedSpanElement.current) return new Typed(document.createElement('span'), {
			strings: TYPED_STRINGS,
			typeSpeed: 50,
			backSpeed: 50,
			backDelay: 8000,
			contentType: 'html',
			loop: true,
		});
		return new Typed(typedSpanElement.current, {
			strings: TYPED_STRINGS,
			typeSpeed: 50,
			backSpeed: 50,
			backDelay: 8000,
			contentType: 'html',
			loop: true,
		});
	};

	const initRevealAnimation = (
		targetSection: React.RefObject<HTMLDivElement | null>
	): GSAPTimeline => {
		if (!targetSection.current) return gsap.timeline();
		const revealTl = gsap.timeline({ defaults: { ease: "power2.out" } });

		// 1. Aurora blooms from center (scale from 0.6 to 1)
		if (auroraRef.current) {
			revealTl.fromTo(
				auroraRef.current,
				{ scale: 0.6, opacity: 0 },
				{ scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
				0.2
			);
		}

		// 2. Hero content sequences in with stagger
		revealTl.from(
			targetSection.current.querySelectorAll(".seq"),
			{ opacity: 0, y: 30, duration: 0.6, stagger: 0.15 },
			0.4
		);

		// 3. Background image slides in from right
		if (bgWrapperRef.current) {
			revealTl.fromTo(
				bgWrapperRef.current,
				{ opacity: 0, x: 60 },
				{ opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
				0.6
			);
		}

		return revealTl;
	};

	useEffect(() => {
		const typed = initTypeAnimation(typedSpanElement);
		initRevealAnimation(targetSection);

		return () => {
			if (typed) {
				typed.destroy();
			}
		};
	}, [typedSpanElement, targetSection]);

	const renderBackgroundImage = (): React.ReactNode => (
		<div ref={bgWrapperRef} className={HERO_STYLES.BG_WRAPPER} style={{ maxHeight: "650px" }}>
			<div
				className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full animate-glow-pulse pointer-events-none"
				style={{
					background: "radial-gradient(circle, rgba(145, 70, 255, 0.15) 0%, transparent 70%)",
					filter: "blur(60px)",
				}}
			/>
			<HeroImage />
		</div>
	);

	const renderSocialLinks = (): React.ReactNode =>
		(Object.keys(SOCIAL_LINKS) as Array<keyof typeof SOCIAL_LINKS>).map((el) => (
			<a
				href={SOCIAL_LINKS[el]}
				key={el}
				className={HERO_STYLES.SOCIAL_LINK}
				rel="noreferrer"
				target="_blank"
				onClick={() => { trackEvent("social_click"); setTag("social_platform", el); }}
			>
				<Image src={`/social/${el}.svg`} alt={el} width={48} height={48} priority />
			</a>
		));

	const renderHeroContent = (): React.ReactNode => (
		<div ref={contentRef} className={HERO_STYLES.CONTENT}>
			<div className="md:mb-4 mb-2">
				{viewCount !== null && (
					<span className="inline-flex items-center gap-1.5 text-sm text-gray-400 seq mb-3">
						<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
						{viewCount.toLocaleString()} visitors
					</span>
				)}
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
					<span className="bg-gradient-to-r from-[#9146FF] via-[#BF94FF] to-[#9146FF] bg-clip-text text-transparent">
						Minh (Mark) Pham
					</span>
				</h1>
			</div>
			<p className="mb-4">
				<span className={HERO_STYLES.TYPED_SPAN} ref={typedSpanElement}></span>
			</p>
			<div className="flex seq gap-4">
				{renderSocialLinks()}
			</div>
			<div className="flex flex-wrap gap-4 seq mt-6">
				<a
					href="/minh_pham_resume.pdf"
					download
					data-magnetic
					onClick={() => { trackEvent("resume_download"); upgradeSession("resume_download"); }}
					className="inline-flex items-center gap-3 px-5 py-3 bg-[#9146FF] hover:bg-[#7B3FD9] text-white text-base font-medium rounded-full transition-all duration-[10ms] hover:shadow-lg hover:shadow-[#9146FF]/25 hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					<span>Download Resume</span>
				</a>
				<a
					href="https://calendly.com/minh-pham-insurify/30min"
					target="_blank"
					rel="noreferrer"
					data-magnetic
					onClick={() => { trackEvent("coffee_chat_click"); upgradeSession("coffee_chat_click"); }}
					className="inline-flex items-center gap-3 px-5 py-3 border-2 border-white/80 hover:border-white bg-white/5 hover:bg-white/10 text-white text-base font-medium rounded-full transition-all duration-[10ms] hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
						<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
						<line x1="6" y1="2" x2="6" y2="4" />
						<line x1="10" y1="2" x2="10" y2="4" />
						<line x1="14" y1="2" x2="14" y2="4" />
					</svg>
					<span>Book a coffee chat</span>
				</a>
			</div>
		</div>
	);

	const { ref: heroSectionRef } = MENULINKS[0];

	return (
		<section
			className={HERO_STYLES.SECTION}
			id={heroSectionRef}
			ref={targetSection}
		>
			<HeroAurora ref={auroraRef} />
			{renderHeroContent()}
			{renderBackgroundImage()}
		</section>
	);
});

HeroSection.displayName = "LandingHero";

export default HeroSection;
