import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Menu from "@/components/common/menu";
import useHideOnScroll from "@/components/common/use-hide-on-scroll";
import { NAVBARITEMS } from "../../constants";
import { trackEvent } from "../../utils/clarity";
import { prefersReducedMotion } from "../../utils/motion";
import { whenPageReady } from "../../utils/page-ready";

// The logo goes home, so the pill carries the 7 sections + 3 pages.
const SECTION_ITEMS = NAVBARITEMS.filter((i) => !i.ref.startsWith("/") && i.ref !== "home");
const PAGE_ITEMS = NAVBARITEMS.filter((i) => i.ref.startsWith("/"));

const NAV_LINK =
	"relative z-10 block whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors duration-[10ms]";

const Header = () => {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [active, setActive] = useState("");
	const headerRef = useRef<HTMLElement>(null);
	const navRef = useRef<HTMLDivElement>(null);
	const pillRef = useRef<HTMLSpanElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	useHideOnScroll(headerRef, menuOpen);

	// Entrance plays when the page is actually on screen (intro letterbox
	// opening, route curtain lifting, or straight away on a direct landing).
	useEffect(() => {
		const el = headerRef.current;
		if (!el) return;
		if (prefersReducedMotion()) {
			gsap.set(el, { opacity: 1 });
			return;
		}
		return whenPageReady(() => {
			gsap.fromTo(
				el,
				{ opacity: 0, y: -18 },
				{ opacity: 1, y: 0, duration: 0.9, ease: "power4.out", delay: 0.15, clearProps: "transform" }
			);
		});
	}, []);

	// Scroll-spy on the homepage (the last section whose top has crossed 40%
	// of the viewport); the current route elsewhere. Pinned sections report a
	// fixed rect, so measure their pin-spacer instead.
	useEffect(() => {
		if (router.pathname !== "/") {
			setActive(router.pathname);
			return;
		}
		// Section tops are measured once (and again whenever ScrollTrigger
		// refreshes or the window resizes), so the per-frame check is just
		// arithmetic on scrollY — no layout reads while scrolling.
		let raf = 0;
		let tops: Array<[string, number]> = [];
		const measure = () => {
			tops = SECTION_ITEMS.flatMap((item): Array<[string, number]> => {
				const el = document.getElementById(item.ref);
				if (!el) return [];
				const parent = el.parentElement;
				const box = parent && parent.classList.contains("pin-spacer") ? parent : el;
				return [[item.ref, box.getBoundingClientRect().top + window.scrollY]];
			});
		};
		const compute = () => {
			raf = 0;
			const line = window.scrollY + window.innerHeight * 0.4;
			let current = "";
			for (const [ref, top] of tops) if (top <= line) current = ref;
			setActive(current);
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(compute);
		};
		const remeasure = () => {
			measure();
			onScroll();
		};
		remeasure();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", remeasure);
		ScrollTrigger.addEventListener("refresh", remeasure);
		// Lazy sections mount after the header; catch their final positions.
		const late = setTimeout(remeasure, 2500);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", remeasure);
			ScrollTrigger.removeEventListener("refresh", remeasure);
			clearTimeout(late);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [router.pathname]);

	// Slide the active pill under the current link (a context change, so it
	// gets authored motion; hovers stay at 10ms).
	useEffect(() => {
		const nav = navRef.current;
		const pill = pillRef.current;
		if (!nav || !pill) return;
		const place = (animate: boolean) => {
			const link = active
				? nav.querySelector<HTMLElement>(`[data-nav="${active}"]`)
				: null;
			if (!link) {
				gsap.to(pill, { opacity: 0, duration: animate ? 0.25 : 0, overwrite: "auto" });
				return;
			}
			const hidden = Number(gsap.getProperty(pill, "opacity")) === 0;
			const props = { x: link.offsetLeft, width: link.offsetWidth };
			if (hidden || !animate || prefersReducedMotion()) {
				gsap.set(pill, props);
				gsap.to(pill, { opacity: 1, duration: animate ? 0.25 : 0, overwrite: "auto" });
			} else {
				gsap.to(pill, { ...props, opacity: 1, duration: 0.3, ease: "power3.out", overwrite: "auto" });
			}
		};
		place(true);
		const onResize = () => place(false);
		window.addEventListener("resize", onResize);
		document.fonts?.ready.then(() => place(false));
		return () => window.removeEventListener("resize", onResize);
	}, [active]);

	const linkClass = (ref: string) =>
		`${NAV_LINK} ${active === ref ? "text-ink-1" : "text-ink-2 hover:text-ink-1"}`;

	const onNavClick = (name: string) => () =>
		trackEvent("nav_link_click", { target: name, location: "header" });

	return (
		<>
			<header
				ref={headerRef}
				className="pointer-events-none fixed inset-x-0 top-0 z-50 select-none px-3 pt-3 md:px-5 md:pt-4"
				style={{ opacity: 0 }}
			>
				<div className="glass pointer-events-auto mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-4 rounded-full pl-5 pr-2 shadow-[0_18px_50px_-24px_rgb(0_0_0/0.9)]">
					<div className="flex items-center gap-3">
						<Link href="/#home">
							<a
								aria-label="Minh (Mark) Pham — home"
								className="flex items-center"
								onClick={() => trackEvent("logo_click")}
							>
								<Image src="/logo.svg" alt="" width={20} height={20} />
							</a>
						</Link>
						<span className="font-mono text-[10px] tracking-[0.12em] text-ink-3">v4.0.0</span>
					</div>

					<nav aria-label="Primary" className="hidden xl:block">
						<div ref={navRef} className="relative flex items-center">
							<span
								ref={pillRef}
								aria-hidden="true"
								className="absolute left-0 top-0 h-full rounded-full border border-white/[0.06] bg-white/[0.07]"
								style={{ opacity: 0 }}
							/>
							{SECTION_ITEMS.map((item) => (
								<a
									key={item.ref}
									data-nav={item.ref}
									href={`/#${item.ref}`}
									className={linkClass(item.ref)}
									onClick={onNavClick(item.name)}
								>
									{item.name}
								</a>
							))}
							<span aria-hidden="true" className="mx-2 h-4 w-px bg-white/[0.16]" />
							{PAGE_ITEMS.map((item) => (
								<Link href={item.ref} key={item.ref}>
									<a
										data-nav={item.ref}
										className={linkClass(item.ref)}
										aria-current={active === item.ref ? "page" : undefined}
										onClick={onNavClick(item.name)}
									>
										{item.name}
									</a>
								</Link>
							))}
						</div>
					</nav>

					<button
						ref={menuButtonRef}
						type="button"
						className="btn-pill btn-glass no-disc h-10 gap-2.5 px-4 text-[13px]"
						aria-expanded={menuOpen}
						aria-controls="site-menu"
						onClick={() => {
							trackEvent("mobile_menu_toggle", { state: menuOpen ? "close" : "open" });
							setMenuOpen((open) => !open);
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
			<Menu open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={menuButtonRef} />
		</>
	);
};

export default Header;
