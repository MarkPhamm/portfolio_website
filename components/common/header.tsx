import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Menu from "@/components/common/menu";
import useHideOnScroll from "@/components/common/use-hide-on-scroll";
import { NAVBARITEMS } from "../../constants";
import Link from "next/link";
import { gsap } from "gsap";
import { trackEvent } from "../../utils/clarity";

const Header = () => {
	const [menuVisible, setmenuVisible] = useState(false);
	const headerRef = useRef<HTMLElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	// Hide on scroll down, reveal on scroll up; parked while the menu is open.
	useHideOnScroll(headerRef, menuVisible);

	useEffect(() => {
		if (headerRef.current) {
			gsap.fromTo(
				headerRef.current,
				{ y: -80, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.1, clearProps: "transform" }
			);
		}
	}, []);

	return (
		<>
			<header ref={headerRef} className="w-full fixed top-0 py-4 md:py-8 select-none z-50 border-b border-white/5 bg-gray-900/80 backdrop-blur-md" style={{ opacity: 0 }}>
				<div className="flex items-center justify-between gap-4 section-container">
					<div className="flex shrink-0 items-center gap-2">
						<Link href="/#home">
							<a className="link" onClick={() => trackEvent("logo_click")}>
								<Image src="/logo.svg" alt="Logo" width={22} height={22} />
							</a>
						</Link>
						<span className="text-[10px] text-white/80 font-mono">v3.20.0</span>
					</div>
					<div className="hidden 2xl:flex items-center justify-center whitespace-nowrap">
						{NAVBARITEMS.map((item: any) => {
							const isExternal = item.ref.startsWith("http");
							const isRoute = !isExternal && item.ref.startsWith("/");
							const onClick = () =>
								trackEvent("nav_link_click", { target: item.name, location: "header" });
							// Route items go through <Link> so navigation stays client-side
							// (prefetch + page-transition curtain); hash anchors stay plain
							// <a> to keep native smooth scrolling on the homepage.
							return isRoute ? (
								<Link href={item.ref} key={item.name}>
									<a className="link px-3 nav-link-hover" onClick={onClick}>
										{item.name}
									</a>
								</Link>
							) : (
								<a
									key={item.name}
									href={isExternal ? item.ref : `/#${item.ref}`}
									className="link px-3 nav-link-hover"
									onClick={onClick}
									{...(isExternal && { target: "_blank", rel: "noreferrer" })}
								>
									{item.name}
								</a>
							);
						})}
					</div>
					<button
						ref={menuButtonRef}
						type="button"
						className="menu-pill shrink-0"
						aria-expanded={menuVisible}
						aria-controls="site-menu"
						onClick={() => {
							trackEvent("mobile_menu_toggle", { state: menuVisible ? "close" : "open" });
							setmenuVisible((open) => !open);
						}}
					>
						<span>Menu</span>
						<span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
							<span className="h-px w-full bg-current" />
							<span className="h-px w-2/3 self-end bg-current" />
						</span>
					</button>
				</div>
			</header>
			<Menu
				open={menuVisible}
				onClose={() => setmenuVisible(false)}
				returnFocusRef={menuButtonRef}
			/>
		</>
	);
};

export default Header;
