import { SOCIAL_LINKS } from "../../constants";
import Image from "next/image";
import Link from "next/link";
import { trackEvent, setTag, upgradeSession } from "../../utils/clarity";

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
	const renderSocialIcons = (): React.ReactNode => (
		<div className="flex flex-wrap gap-2">
			{(Object.keys(SOCIAL_LINKS) as Array<keyof typeof SOCIAL_LINKS>).map((el) => (
				<a
					href={SOCIAL_LINKS[el]}
					key={el}
					className="link hover:opacity-90 hover:scale-110 transition-all duration-[10ms]"
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
		<div className="col-span-2 md:col-span-1">
			<div className="flex items-center gap-2.5 mb-3">
				<Image src="/logo.svg" alt="" width={26} height={26} />
				<span className="font-bold text-lg">Minh (Mark) Pham</span>
			</div>
			<p className="text-sm text-white/90 mb-2 max-w-[16rem]">
				I bridge the gap between data and actionable insights.
			</p>
			<p className="text-sm text-white/80">
				Analytics Engineer @ Insurify
				<br />
				Boston, MA
			</p>
		</div>
	);

	const renderExplore = (): React.ReactNode => (
		<div>
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
		<div>
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
		<div className="col-span-2 md:col-span-1">
			<p className={COLUMN_HEADING}>Connect with me</p>
			<div className="space-y-2.5 mb-4">
				<a
					href="https://calendly.com/minh-pham-insurify/30min"
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
		<div className="w-full border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-white/70">
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
