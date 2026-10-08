import { CALENDLY_URL, RESUME_URL, SOCIAL_LABELS, SOCIAL_LINKS } from "../../constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { trackEvent, setTag, upgradeSession } from "../../utils/clarity";
import { EASE, prefersReducedMotion } from "../../utils/motion";

const EXPLORE_LINKS = [
	{ name: "Home", ref: "home" },
	{ name: "Skillset", ref: "skills" },
	{ name: "Articles", ref: "articles" },
	{ name: "Projects", ref: "works" },
	{ name: "My Activity", ref: "activity" },
	{ name: "Experience", ref: "timeline" },
];

const ABOUT_LINKS = [
	{ name: "Passion", href: "/aboutme/passion" },
	{ name: "Start-up", href: "/aboutme/startup" },
	{ name: "Reads", href: "/aboutme/reads" },
];

// Mark's LinkedIn About section, verbatim — also the OG card caption.
const WORDMARK = ["Whatever", "it", "takes."];

const COLUMN_HEADING = "mono-label mb-5";
const FOOTER_LINK =
	"block w-fit text-[15px] text-ink-2 transition-colors duration-[10ms] hover:text-ink-1";

/**
 * Footer. From md up — and only when it fits in the viewport — it's a
 * "reveal" footer: fixed behind a clip-path window, so the page lifts off
 * it as you reach the end. Elsewhere it's in normal flow.
 */
const Footer = () => {
	const wrapRef = useRef<HTMLDivElement>(null);
	const footerRef = useRef<HTMLElement>(null);
	const [revealHeight, setRevealHeight] = useState<number | null>(null);

	// Decide reveal mode from the footer's real height.
	useEffect(() => {
		const footer = footerRef.current;
		if (!footer) return;
		const mq = window.matchMedia("(min-width: 768px)");
		const measure = () => {
			const h = footer.offsetHeight;
			setRevealHeight(mq.matches && h < window.innerHeight * 0.9 ? h : null);
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(footer);
		window.addEventListener("resize", measure);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, []);

	// Entrance: columns rise, then the wordmark climbs out of its masks.
	// Triggered off the wrapper — a fixed footer never moves on scroll.
	useEffect(() => {
		const wrap = wrapRef.current;
		const footer = footerRef.current;
		if (!wrap || !footer || prefersReducedMotion()) return;
		const cols = footer.querySelectorAll(".footer-col");
		const words = footer.querySelectorAll(".wordmark-word");
		const bottom = footer.querySelector(".footer-bottom");
		if (ScrollTrigger.isInViewport(wrap, 0.2)) return;

		gsap.set(cols, { opacity: 0, y: 26 });
		gsap.set(words, { yPercent: 105 });
		if (bottom) gsap.set(bottom, { opacity: 0 });

		const trigger = ScrollTrigger.create({
			trigger: wrap,
			start: "top 85%",
			once: true,
			onEnter: () => {
				gsap
					.timeline()
					.to(cols, { opacity: 1, y: 0, duration: 0.55, ease: EASE.out, stagger: 0.05 })
					.to(words, { yPercent: 0, duration: 0.9, ease: EASE.out, stagger: 0.06 }, 0.1)
					.to(bottom, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.4);
			},
		});
		return () => trigger.kill();
	}, []);

	const renderIdentity = (): React.ReactNode => (
		<div className="footer-col col-span-2 md:col-span-1">
			<div className="mb-4 flex items-center gap-2.5">
				{/* Eager: the reveal footer is fixed (clipped) in the viewport from the
				    start, and it's the same cached SVG as the header logo. */}
				<Image src="/logo.svg" alt="" width={22} height={22} loading="eager" />
				<span className="text-lg font-normal tracking-[-0.02em] text-ink-1">Minh (Mark) Pham</span>
			</div>
			<p className="mb-3 max-w-[17rem] text-[15px] leading-relaxed text-ink-2">
				I bridge the gap between data and actionable insights.
			</p>
			<p className="text-sm leading-relaxed text-ink-3">
				Senior Analytics Engineer @ Infinite Lambda
				<br />
				Remote
			</p>
		</div>
	);

	const renderExplore = (): React.ReactNode => (
		<div className="footer-col">
			<p className={COLUMN_HEADING}>Explore</p>
			<div className="space-y-2.5">
				{EXPLORE_LINKS.map((item) => (
					<a
						key={item.name}
						href={`/#${item.ref}`}
						className={FOOTER_LINK}
						onClick={() => trackEvent("nav_link_click", { target: item.name, location: "footer" })}
					>
						{item.name}
					</a>
				))}
			</div>
		</div>
	);

	const renderAbout = (): React.ReactNode => (
		<div className="footer-col">
			<p className={COLUMN_HEADING}>About me</p>
			<div className="space-y-2.5">
				{ABOUT_LINKS.map((item) => (
					<Link href={item.href} key={item.name}>
						<a
							className={FOOTER_LINK}
							onClick={() => trackEvent("nav_link_click", { target: item.name, location: "footer" })}
						>
							{item.name}
						</a>
					</Link>
				))}
			</div>
		</div>
	);

	const renderConnect = (): React.ReactNode => (
		<div className="footer-col col-span-2 md:col-span-1">
			<p className={COLUMN_HEADING}>Connect with me</p>
			<div className="mb-6 space-y-2.5">
				<a
					href={CALENDLY_URL}
					target="_blank"
					rel="noreferrer"
					className={FOOTER_LINK}
					onClick={() => { trackEvent("coffee_chat_click"); upgradeSession("coffee_chat_click"); }}
				>
					Book a coffee chat <span className="text-accent-soft">↗</span>
				</a>
				<a
					href={RESUME_URL}
					download
					className={FOOTER_LINK}
					onClick={() => { trackEvent("resume_download"); upgradeSession("resume_download"); }}
				>
					Download resume <span className="text-accent-soft">↓</span>
				</a>
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-2">
				{(Object.keys(SOCIAL_LINKS) as Array<keyof typeof SOCIAL_LINKS>).map((el) => (
					<a
						href={SOCIAL_LINKS[el]}
						key={el}
						className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3 transition-colors duration-[10ms] hover:text-ink-1"
						rel="noreferrer"
						target="_blank"
						onClick={() => { trackEvent("footer_social_click"); setTag("social_platform", el); }}
					>
						{SOCIAL_LABELS[el]}
					</a>
				))}
			</div>
		</div>
	);

	const renderBottomBar = (): React.ReactNode => (
		<div className="footer-bottom mt-14 flex w-full flex-col gap-2 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 sm:flex-row sm:justify-between">
			<span>© 2025–2026 Minh (Mark) Pham</span>
			<span>
				Built with Next.js, Tailwind &amp; GSAP —{" "}
				<a
					href="https://github.com/HoanqDucAnh/portfolio"
					target="_blank"
					rel="noreferrer"
					className="text-ink-2 underline decoration-white/20 underline-offset-4 transition-colors duration-[10ms] hover:text-ink-1"
					onClick={() => trackEvent("footer_source_click")}
				>
					source on GitHub
				</a>
			</span>
		</div>
	);

	const reveal = revealHeight !== null;

	return (
		<div
			ref={wrapRef}
			className="relative w-full"
			style={
				reveal
					? { height: revealHeight, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }
					: undefined
			}
		>
			<footer
				ref={footerRef}
				id="footer"
				className={`${reveal ? "fixed bottom-0 left-0" : "relative"} w-full select-none overflow-hidden border-t border-line`}
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"radial-gradient(70% 55% at 50% 115%, rgb(var(--accent) / 0.24), transparent 70%)",
					}}
				/>
				<div className="section-container relative pt-20 md:pt-28">
					<div className="grid w-full grid-cols-2 gap-10 md:grid-cols-4">
						{renderIdentity()}
						{renderExplore()}
						{renderAbout()}
						{renderConnect()}
					</div>
					{renderBottomBar()}
				</div>
				{/* Sized to span the viewport and bleed off the bottom edge. */}
				<p
					className="type-wordmark title-silver relative -mb-[0.14em] mt-10 whitespace-nowrap text-center md:mt-14"
					style={{ fontSize: "clamp(2.75rem, 10.4vw, 20rem)" }}
				>
					{WORDMARK.map((word, i) => (
						<span
							key={word}
							className={`inline-block overflow-hidden align-bottom ${
								i < WORDMARK.length - 1 ? "mr-[0.22em]" : ""
							}`}
						>
							<span className="wordmark-word inline-block">{word}</span>
						</span>
					))}
				</p>
			</footer>
		</div>
	);
};

export default Footer;
