// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Menu from "@/components/common/menu";
import { NAVBARITEMS } from "../../constants";
import Link from "next/link";
import { gsap } from "gsap";
import { trackEvent } from "../../utils/clarity";

const Header = () => {
	const [menuVisible, setmenuVisible] = useState(false);
	const headerRef = useRef<HTMLElement>(null);

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
		<header ref={headerRef} className={`w-full fixed top-0 py-4 md:py-8 select-none z-50 border-b border-white/5 ${menuVisible ? "bg-transparent" : "bg-gray-900/80 backdrop-blur-md"}`} style={{ opacity: 0 }}>
			<div className="flex justify-between section-container">
				<div className="flex items-center gap-2">
					<Link href="/#home">
						<a className="link" onClick={() => trackEvent("logo_click")}>
							<Image src="/logo.svg" alt="Logo" width={22} height={22} />
						</a>
					</Link>
					<span className="text-[10px] text-white/30 font-mono">v3.2.2</span>
				</div>
				<div className="hidden md:flex items-center justify-center">
					{NAVBARITEMS.map((item: any) => (
						<a
							key={item.name}
							href={item.ref.startsWith('http') ? item.ref : (item.ref.startsWith('/') ? item.ref : `/#${item.ref}`)}
							className="link px-3 nav-link-hover"
							onClick={() => trackEvent("nav_link_click", { target: item.name, location: "header" })}
							{...(item.ref.startsWith('http') && { target: "_blank", rel: "noreferrer" })}
						>
							{item.name}
						</a>
					))}
				</div>
				<nav className={`outer-menu md:hidden ${menuVisible ? "menu-visible" : ""}`}>
					<button
						className="hamburger w-6 h-6 flex items-center justify-center link relative"
						onClick={() => {
							setmenuVisible((prev) => {
								trackEvent("mobile_menu_toggle", { state: prev ? "close" : "open" });
								return !prev;
							});
						}}
					>
						<div className="relative flex-none w-full bg-white duration-[10ms] flex items-center justify-center"></div>
					</button>
					<Menu setmenuVisible={setmenuVisible} />
				</nav>
				<div className="hidden md:block w-[22px]" />
			</div>
		</header>
	);
};

export default Header;
