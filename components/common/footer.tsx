import { SOCIAL_LINKS } from "../../constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { trackEvent, setTag, upgradeSession } from "../../utils/clarity";
import { prefersReducedMotion } from "../../utils/motion";

gsap.registerPlugin(ScrollTrigger);

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

const COLUMN_HEADING = "text-white/80 text-xs uppercase tracking-widest mb-4";
const FOOTER_LINK = "link block text-sm text-white/90 hover:text-white w-fit";

const Footer = () => {
	const footerRef = useRef<HTMLElement>(null);

	// Entrance choreography: columns rise in sequence, social icons pop,
	// bottom bar fades in last.
	useEffect(() => {
		if (!footerRef.current || prefersReducedMotion()) return;

		const el = footerRef.current;
		const cols = el.querySelectorAll(".footer-col");
		const socials = el.querySelectorAll(".footer-social");
		const bottom = el.querySelector(".footer-bottom");

		gsap.set(cols, { opacity: 0, y: 30 });
		gsap.set(socials, { scale: 0 });
		if (bottom) gsap.set(bottom, { opacity: 0 });

		const trigger = ScrollTrigger.create({
			trigger: el,
			start: "top 92%",
			once: true,
			onEnter: () => {
				const tl = gsap.timeline();
				tl.to(cols, {
					opacity: 1,
					y: 0,
					duration: 0.6,
					ease: "power3.out",
					stagger: 0.1,
				})
					.to(
						socials,
						{ scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.05 },
						"-=0.4"
					)
					.to(bottom, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2");
			},
		});

		return () => trigger.kill();
	}, []);

	const renderSocialIcons = (): React.ReactNode => (
		<div className="flex flex-wrap gap-2">
			{(Object.keys(SOCIAL_LINKS) as Array<keyof typeof SOCIAL_LINKS>).map((el) => (
				<a
					href={SOCIAL_LINKS[el]}
					key={el}
					className="footer-social link hover:opacity-90 hover:scale-110 transition-all duration-[10ms]"
					rel="noreferrer"
					target="_blank"
					onClick={() => { trackEvent("footer_social_click"); setTag("social_platform", el); }}
				>
					<Image src={`/social/${el}.svg`} alt={el} width={32} height={32} />
				</a>
			))}
		</div>
	);

	const renderIdentity = (): React.ReactNode => (
		<div className="footer-col col-span-2 md:col-span-1">
			<div className="flex items-center gap-2.5 mb-3">
				<Image src="/logo.svg" alt="" width={26} height={26} />
				<span className="font-bold text-lg">Minh (Mark) Pham</span>
			</div>
			<p className="text-sm text-white/90 mb-2 max-w-[16rem]">
				I bridge the gap between data and actionable insights.
			</p>
			<p className="text-sm text-white/80">
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
			<div className="space-y-2.5 mb-4">
				<a
					href="https://calendly.com/minhbpham2003/30min"
					target="_blank"
					rel="noreferrer"
					className={FOOTER_LINK}
					onClick={() => { trackEvent("coffee_chat_click"); upgradeSession("coffee_chat_click"); }}
				>
					Book a coffee chat ↗
				</a>
				<a
					href="/minh_pham_resume.pdf"
					download
					className={FOOTER_LINK}
					onClick={() => { trackEvent("resume_download"); upgradeSession("resume_download"); }}
				>
					Download resume ↓
				</a>
			</div>
			{renderSocialIcons()}
		</div>
	);

	const renderBottomBar = (): React.ReactNode => (
		<div className="footer-bottom w-full border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-white/80">
			<span>© 2025–2026 Minh (Mark) Pham</span>
			<span>
				Built with Next.js, Tailwind &amp; GSAP —{" "}
				<a
					href="https://github.com/HoanqDucAnh/portfolio"
					target="_blank"
					rel="noreferrer"
					className="link underline hover:text-white"
					onClick={() => trackEvent("footer_source_click")}
				>
					source on GitHub
				</a>
			</span>
		</div>
	);

	return (
		<footer
			ref={footerRef}
			className="w-full relative select-none bg-cover flex flex-col items-stretch"
			id="footer"
		>
			<img
				src="/footer-curve.svg"
				alt=""
				className="w-full"
				loading="lazy"
				height={290}
				role="presentation"
				width={1440}
			/>
			<div className="h-full w-full">
				<div className="section-container flex-col flex h-full justify-end z-10 py-10 md:py-14">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 w-full">
						{renderIdentity()}
						{renderExplore()}
						{renderAbout()}
						{renderConnect()}
					</div>
					{renderBottomBar()}
				</div>
			</div>
		</footer>
	);
};

export default Footer;
