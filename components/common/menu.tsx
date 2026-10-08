import React, { useEffect, useRef, useState } from "react";
// @ts-ignore — no @types/react-dom in this repo (same as skills.tsx)
import ReactDOM from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { CALENDLY_URL, NAVBARITEMS, SOCIAL_LABELS, SOCIAL_LINKS } from "../../constants";
import { setTag, trackEvent, upgradeSession } from "../../utils/clarity";
import { prefersReducedMotion } from "../../utils/motion";

const SECTIONS = NAVBARITEMS.filter((i) => !i.ref.startsWith("/"));
const PAGES = NAVBARITEMS.filter((i) => i.ref.startsWith("/"));

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// body overflow never reaches the viewport (html has overflow-x: hidden), so
// lock the root element itself.
const lockScroll = () => {
	document.documentElement.style.overflow = "hidden";
};
const unlockScroll = () => {
	document.documentElement.style.overflow = "";
};

type MenuProps = {
	open: boolean;
	onClose: () => void;
	returnFocusRef: React.RefObject<HTMLElement>;
};

/**
 * Full-screen menu, portaled to <body> so the header's hide-on-scroll
 * transform can't become its containing block. Section links scroll the page
 * while the sheet closes over it, so the section is already in place when
 * the menu lifts.
 */
const Menu = ({ open, onClose, returnFocusRef }: MenuProps) => {
	const [mounted, setMounted] = useState(false);
	const [rendered, setRendered] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const lockedRef = useRef(false);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (open) setRendered(true);
	}, [open]);

	// Always release the scroll lock, even if the page unmounts mid-close
	// (page links navigate away while the sheet is still animating).
	useEffect(
		() => () => {
			if (lockedRef.current) {
				lockedRef.current = false;
				unlockScroll();
			}
		},
		[]
	);

	useEffect(() => {
		const root = rootRef.current;
		if (!root || !rendered) return;
		const reduce = prefersReducedMotion();
		const links = root.querySelectorAll(".menu-rise");
		const fades = root.querySelectorAll(".menu-fade");

		if (open) {
			if (!lockedRef.current) {
				lockedRef.current = true;
				lockScroll();
			}
			const tl = gsap.timeline();
			if (reduce) {
				gsap.set(root, { clipPath: "inset(0% 0% 0% 0%)" });
				gsap.set(links, { yPercent: 0 });
				gsap.set(fades, { opacity: 1, y: 0 });
			} else {
				tl.fromTo(
					root,
					{ clipPath: "inset(0% 0% 100% 0%)" },
					{ clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.inOut" }
				)
					.fromTo(
						links,
						{ yPercent: 110 },
						{ yPercent: 0, duration: 0.6, ease: "power4.out", stagger: 0.035 },
						0.18
					)
					.fromTo(
						fades,
						{ opacity: 0, y: 14 },
						{ opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.04 },
						0.3
					);
			}
			root.querySelector<HTMLElement>("[data-menu-close]")?.focus();
			return () => {
				tl.kill();
			};
		}

		const finish = () => {
			setRendered(false);
			if (lockedRef.current) {
				lockedRef.current = false;
				unlockScroll();
			}
			returnFocusRef.current?.focus();
		};
		if (reduce) {
			finish();
			return;
		}
		const tl = gsap
			.timeline({ onComplete: finish })
			.to(links, { yPercent: -110, duration: 0.25, ease: "power3.in", stagger: 0.015 })
			.to(fades, { opacity: 0, duration: 0.2 }, 0)
			.to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.45, ease: "power3.inOut" }, 0.12);
		return () => {
			tl.kill();
		};
	}, [open, rendered, returnFocusRef]);

	// Escape closes; Tab stays inside the dialog.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}
			if (e.key !== "Tab" || !rootRef.current) return;
			const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
			if (!items.length) return;
			const first = items[0];
			const last = items[items.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!mounted || !rendered) return null;

	const navClick = (name: string) => () => {
		trackEvent("nav_link_click", { target: name, location: "mobile_menu" });
		// The root is still locked while the sheet closes, so release it now
		// or the hash jump has nothing to scroll.
		if (lockedRef.current) {
			lockedRef.current = false;
			unlockScroll();
		}
		onClose();
	};

	return ReactDOM.createPortal(
		<div
			ref={rootRef}
			id="site-menu"
			role="dialog"
			aria-modal="true"
			aria-label="Site menu"
			className="site-menu fixed inset-0 z-[60] overflow-y-auto"
			style={{ clipPath: "inset(0% 0% 100% 0%)" }}
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0"
				style={{
					background: "radial-gradient(70% 60% at 85% 0%, rgb(145 70 255 / 0.18), transparent 70%)",
				}}
			/>
			<div className="relative flex min-h-full flex-col px-3 pb-10 pt-3 md:px-5 md:pt-4">
				<div className="flex h-14 items-center justify-between pl-5 pr-2">
					<Image src="/logo.svg" alt="" width={20} height={20} />
					<button type="button" data-menu-close className="menu-pill" onClick={onClose}>
						Close
						<span aria-hidden="true" className="relative block h-3 w-3">
							<span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
							<span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
						</span>
					</button>
				</div>

				<div className="section-container mt-10 grid w-full flex-1 gap-14 md:mt-16 lg:grid-cols-[1.6fr_1fr]">
					<nav aria-label="Sections">
						<ol className="space-y-1">
							{SECTIONS.map((item, i) => (
								<li key={item.ref} className="overflow-hidden">
									<a
										href={`/#${item.ref}`}
										onClick={navClick(item.name)}
										className="menu-rise group flex items-baseline gap-4 py-1 text-[#a3a1ad] transition-colors duration-[10ms] hover:text-[#f5f4f7]"
									>
										<span className="menu-mono text-[11px] tracking-[0.14em] text-[#807e8a] group-hover:text-[#BF94FF]">
											{String(i + 1).padStart(2, "0")}
										</span>
										<span className="text-[clamp(2.25rem,6vw,4.5rem)] font-light leading-[1.05] tracking-[-0.04em]">
											{item.name}
										</span>
									</a>
								</li>
							))}
						</ol>
					</nav>

					<div className="flex flex-col gap-10 lg:pt-4">
						<div className="menu-fade">
							<p className="menu-label mb-4">About me</p>
							<ul className="space-y-2">
								{PAGES.map((item) => (
									<li key={item.ref}>
										<Link href={item.ref}>
											<a
												onClick={navClick(item.name)}
												className="text-2xl font-light tracking-[-0.02em] text-[#f5f4f7] transition-colors duration-[10ms] hover:text-[#BF94FF]"
											>
												{item.name}
											</a>
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div className="menu-fade">
							<p className="menu-label mb-4">Elsewhere</p>
							<ul className="grid grid-cols-2 gap-x-6 gap-y-2">
								{(Object.keys(SOCIAL_LINKS) as Array<keyof typeof SOCIAL_LINKS>).map((key) => (
									<li key={key}>
										<a
											href={SOCIAL_LINKS[key]}
											target="_blank"
											rel="noreferrer"
											onClick={() => {
												trackEvent("social_click");
												setTag("social_platform", key);
											}}
											className="text-sm text-[#a3a1ad] transition-colors duration-[10ms] hover:text-[#f5f4f7]"
										>
											{SOCIAL_LABELS[key]} <span className="text-[#807e8a]">↗</span>
										</a>
									</li>
								))}
							</ul>
						</div>
						<div className="menu-fade">
							<a
								href={CALENDLY_URL}
								target="_blank"
								rel="noreferrer"
								className="menu-pill menu-pill-primary"
								onClick={() => {
									trackEvent("coffee_chat_click");
									upgradeSession("coffee_chat_click");
								}}
							>
								Book a coffee chat
								<span className="menu-disc" aria-hidden="true">
									↗
								</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default Menu;
