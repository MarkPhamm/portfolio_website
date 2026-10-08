import { CALENDLY_URL, MENULINKS, RESUME_URL, SOCIAL_LABELS, SOCIAL_LINKS, TYPED_STRINGS } from "../../constants";
import React, { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import { gsap } from "gsap";
import { SiDiscord, SiGithub, SiLeetcode, SiLinkedin, SiSubstack, SiWakatime } from "react-icons/si";
import { trackEvent, setTag, upgradeSession } from "../../utils/clarity";
import { EASE, MQ, initMagneticHover, prefersReducedMotion } from "../../utils/motion";
import { whenPageReady } from "../../utils/page-ready";

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
			import("firebase/firestore/lite"),
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

const SOCIAL_ICONS: Record<keyof typeof SOCIAL_LINKS, React.ComponentType<{ className?: string }>> = {
	linkedin: SiLinkedin,
	github: SiGithub,
	substack: SiSubstack,
	wakatime: SiWakatime,
	leetcode: SiLeetcode,
	discord: SiDiscord,
};

// Name split into words at render time (SSR-safe): each word racks into
// focus on its own. Words are fully opaque from the first frame (lowered and
// blurred in CSS) so the H1 paint counts as the LCP — never fade, mask or
// clip it.
const NAME = [
	{ word: "Minh", tone: "" },
	{ word: "(Mark)", tone: "t2" },
	{ word: "Pham", tone: "" },
];

const HeroSection = React.memo(() => {
	const [viewCount, setViewCount] = useState<number | null>(null);

	useEffect(() => {
		// Load cached count immediately for instant display
		const cached = getCachedViewCount();
		if (cached !== null) {
			setViewCount(cached);
		}
		// Defer the network refresh (ipify -> Firestore) until after first interactive
		// so it doesn't compete with hydration / hero LCP.
		const ric = (window as Window & {
			requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
			cancelIdleCallback?: (id: number) => void;
		}).requestIdleCallback;
		let idleHandle: number | undefined;
		let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
		const run = () => countview(setViewCount);
		if (typeof ric === "function") {
			idleHandle = ric(run, { timeout: 4000 });
		} else {
			timeoutHandle = setTimeout(run, 2500);
		}
		return () => {
			if (idleHandle !== undefined) {
				const cancel = (window as Window & {
					cancelIdleCallback?: (id: number) => void;
				}).cancelIdleCallback;
				cancel?.(idleHandle);
			}
			if (timeoutHandle) clearTimeout(timeoutHandle);
		};
	}, []);

	const sectionRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const typedRef = useRef<HTMLSpanElement>(null);
	const resumeCtaRef = useRef<HTMLAnchorElement>(null);
	const coffeeCtaRef = useRef<HTMLAnchorElement>(null);

	// Entrance — plays when the page is on screen (intro opening, curtain
	// lifting, or direct landing). Typed starts once the name has landed.
	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;
		const words = section.querySelectorAll(".hero-word");
		const seq = section.querySelectorAll(".hero-seq");
		let typed: Typed | null = null;
		let typeTimer: ReturnType<typeof setTimeout> | undefined;

		const startTyping = () => {
			if (!typedRef.current) return;
			typed = new Typed(typedRef.current, {
				strings: TYPED_STRINGS,
				typeSpeed: 50,
				backSpeed: 50,
				backDelay: 8000,
				contentType: "html",
				loop: true,
			});
		};

		if (prefersReducedMotion()) {
			gsap.set(seq, { opacity: 1 });
			// Static first line instead of a typing loop.
			if (typedRef.current) typedRef.current.innerHTML = TYPED_STRINGS[0];
			return;
		}

		let tl: gsap.core.Timeline | null = null;
		const cancelReady = whenPageReady(() => {
			const blur = window.matchMedia(MQ.desktop).matches;
			tl = gsap
				.timeline({ defaults: { ease: EASE.out } })
				// Focus pull from the CSS first-frame state (lowered + blurred);
				// the name stays fully opaque throughout, so it's the LCP paint.
				.fromTo(
					words,
					{ yPercent: 30, ...(blur && { filter: "blur(14px)" }) },
					{ yPercent: 0, ...(blur && { filter: "blur(0px)" }), duration: 1, stagger: 0.06 },
					0.05
				)
				.fromTo(seq, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05 }, 0.25);
			typeTimer = setTimeout(startTyping, 600);
		});

		return () => {
			cancelReady();
			tl?.kill();
			if (typeTimer) clearTimeout(typeTimer);
			typed?.destroy();
		};
	}, []);

	// Scroll: the page slides up over the light, and the hero content drifts
	// at a slower pace (depth) while fading out. No pin — the backdrop is
	// fixed, so there's no stage to hold.
	//
	// Built on the first sign of scrolling, not at load, so nothing touches
	// the H1's ancestors while LCP is still being measured (it stops at the
	// first input anyway, and the drift only matters once you scroll).
	useEffect(() => {
		const section = sectionRef.current;
		const content = contentRef.current;
		if (!section || !content) return;
		let mm: gsap.MatchMedia | null = null;
		const intents = ["wheel", "touchstart", "keydown", "pointerdown", "scroll"] as const;

		const build = () => {
			intents.forEach((ev) => window.removeEventListener(ev, build));
			if (mm) return;
			mm = gsap.matchMedia();
			mm.add(MQ.motion, () => {
				gsap
					.timeline({
						scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
					})
					.to(content, { yPercent: 30, ease: "none" }, 0)
					.to(content, { opacity: 0, ease: "power1.in" }, 0);
			});
		};

		if (window.scrollY > 0) build();
		else intents.forEach((ev) => window.addEventListener(ev, build, { passive: true }));
		return () => {
			intents.forEach((ev) => window.removeEventListener(ev, build));
			mm?.revert();
		};
	}, []);

	// Pointer parallax on the content block (desktop pointers only).
	useEffect(() => {
		const section = sectionRef.current;
		const inner = innerRef.current;
		if (!section || !inner || prefersReducedMotion() || !window.matchMedia(MQ.fine).matches) return;
		const xTo = gsap.quickTo(inner, "x", { duration: 1.2, ease: "power3" });
		const yTo = gsap.quickTo(inner, "y", { duration: 1.2, ease: "power3" });
		const onMove = (e: MouseEvent) => {
			const rect = section.getBoundingClientRect();
			xTo(((e.clientX - rect.left) / rect.width - 0.5) * -10);
			yTo(((e.clientY - rect.top) / rect.height - 0.5) * -8);
		};
		section.addEventListener("mousemove", onMove, { passive: true });
		return () => section.removeEventListener("mousemove", onMove);
	}, []);

	// Magnetic hover on the two CTAs (desktop pointers only, respects reduced motion)
	useEffect(() => {
		const cleanups = [
			initMagneticHover(resumeCtaRef.current),
			initMagneticHover(coffeeCtaRef.current),
		];
		return () => cleanups.forEach((fn) => fn());
	}, []);

	const renderSocialLinks = (): React.ReactNode =>
		(Object.keys(SOCIAL_LINKS) as Array<keyof typeof SOCIAL_LINKS>).map((el) => {
			const Icon = SOCIAL_ICONS[el];
			return (
				<a
					href={SOCIAL_LINKS[el]}
					key={el}
					aria-label={SOCIAL_LABELS[el]}
					className="glass grid h-11 w-11 place-items-center rounded-full text-ink-2 transition-colors duration-[10ms] hover:border-white/[0.28] hover:text-ink-1"
					rel="noreferrer"
					target="_blank"
					onClick={() => { trackEvent("social_click"); setTag("social_platform", el); }}
				>
					<Icon className="h-[17px] w-[17px]" />
				</a>
			);
		});

	const { ref: heroSectionRef } = MENULINKS[0];

	return (
		<section ref={sectionRef} id={heroSectionRef} className="hero-screen relative w-full select-none">
			<div ref={contentRef} className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
				<div ref={innerRef} className="flex flex-col items-center">
					{/* Fixed height: the H1 is vertically centred, so a late
					    count must not push it around. */}
					<div className="hero-seq mb-7 flex h-8 items-center">
						{viewCount !== null && (
							<span className="eyebrow">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgb(52_211_153/0.8)]" />
								{viewCount.toLocaleString()} visitors
							</span>
						)}
					</div>

					<h1 className="type-hero title-silver">
						{NAME.map(({ word, tone }, i) => (
							<React.Fragment key={word}>
								<span className={`hero-word inline-block ${tone}`}>{word}</span>
								{i < NAME.length - 1 && " "}
							</React.Fragment>
						))}
					</h1>

					<p className="hero-seq mt-6 min-h-[1.6em] text-lg font-light tracking-[-0.01em] text-ink-2 sm:text-xl md:text-2xl">
						<span ref={typedRef} />
					</p>

					<div className="hero-seq mt-9 flex flex-wrap justify-center gap-2">{renderSocialLinks()}</div>

					<div className="hero-seq mt-8 flex flex-wrap justify-center gap-3">
						<a
							ref={resumeCtaRef}
							href={RESUME_URL}
							download
							onClick={() => { trackEvent("resume_download"); upgradeSession("resume_download"); }}
							className="btn-pill btn-primary"
						>
							Download resume
							<span className="btn-disc" aria-hidden="true">
								<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 4v12M6 11l6 6 6-6M5 20h14" />
								</svg>
							</span>
						</a>
						<a
							ref={coffeeCtaRef}
							href={CALENDLY_URL}
							target="_blank"
							rel="noreferrer"
							onClick={() => { trackEvent("coffee_chat_click"); upgradeSession("coffee_chat_click"); }}
							className="btn-pill btn-glass"
						>
							Book a coffee chat
							<span className="btn-disc" aria-hidden="true">
								<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
									<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
									<line x1="6" y1="2" x2="6" y2="4" />
									<line x1="10" y1="2" x2="10" y2="4" />
									<line x1="14" y1="2" x2="14" y2="4" />
								</svg>
							</span>
						</a>
					</div>
				</div>
			</div>

			<div className="hero-seq pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
				<span className="mono-label">Scroll</span>
				<span className="scroll-cue block h-10 w-px overflow-hidden bg-white/10">
					<span className="block h-full w-full bg-ink-1" />
				</span>
			</div>
		</section>
	);
});

HeroSection.displayName = "LandingHero";

export default HeroSection;
