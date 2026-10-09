import React, { useEffect, useRef, useState } from "react";
import Router from "next/router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { NAVBARITEMS } from "../../nav";
import { prefersReducedMotion } from "../../utils/motion";
import { getLenis, scrollToTarget } from "../../utils/scroll";
import { markPageReady, resetPageReady } from "../../utils/page-ready";

const labelFor = (path: string): string => {
	if (path === "/") return "Home";
	return NAVBARITEMS.find((item) => item.ref === path)?.name ?? "";
};

// Wait until a freshly rendered page stops growing: lazy next/dynamic
// sections render empty first, so a hash target isn't where it will end up.
const settled = (): Promise<void> =>
	new Promise((resolve) => {
		const startedAt = performance.now();
		let last = -1;
		let stableFrames = 0;
		const check = () => {
			const h = document.body.scrollHeight;
			stableFrames = h === last ? stableFrames + 1 : 0;
			last = h;
			if (stableFrames >= 2 || performance.now() - startedAt > 1000) resolve();
			else requestAnimationFrame(check);
		};
		requestAnimationFrame(check);
	});

const jumpToTop = () => {
	window.scrollTo(0, 0);
	getLenis()?.scrollTo(0, { immediate: true, force: true });
};

/**
 * Route curtain. Internal link clicks are intercepted in the capture phase
 * (preventDefault only — the links' own analytics onClicks still run, and
 * Next's <Link> skips navigation because defaultPrevented is set), so the
 * cover always lands before the router swaps pages: no scroll jump is ever
 * visible. Back/forward get the same treatment via beforePopState.
 * Hashes never go through the router (Next re-runs scrollToHash on every
 * render while one is set); they are applied with replaceState instead.
 * Reduced motion: no interception at all — Next's normal hard cut.
 */
const TransitionController = () => {
	const rootRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const labelRef = useRef<HTMLDivElement>(null);
	const [label, setLabel] = useState({ name: "", path: "" });

	useEffect(() => {
		window.history.scrollRestoration = "manual";
		if (prefersReducedMotion()) return;

		const root = rootRef.current;
		const panel = panelRef.current;
		const labelEl = labelRef.current;
		if (!root || !panel || !labelEl) return;

		let busy = false;
		let queued: { path: string; hash: string } | null = null;
		let safety: ReturnType<typeof setTimeout> | undefined;
		// Scroll positions per Next history index, for back/forward. Next has
		// already moved its index to the destination by the time
		// beforePopState runs, so track the index of the page on screen.
		const savedScroll = new Map<number, number>();
		const historyIdx = (): number =>
			window.history.state && typeof window.history.state.idx === "number"
				? window.history.state.idx
				: 0;
		let currentIdx = historyIdx();

		gsap.set(panel, { yPercent: 100 });

		const cover = (instant: boolean) =>
			new Promise<void>((resolve) => {
				gsap.killTweensOf([panel, labelEl]);
				gsap.set(root, { visibility: "visible", pointerEvents: "auto" });
				if (instant) {
					gsap.set(panel, { yPercent: 0 });
					gsap.set(labelEl, { yPercent: 0, opacity: 1 });
					resolve();
					return;
				}
				gsap
					.timeline({ onComplete: () => resolve() })
					.fromTo(
						panel,
						{ yPercent: 100 },
						{ yPercent: 0, duration: 0.45, ease: "power3.inOut" }
					)
					.fromTo(
						labelEl,
						{ yPercent: 110, opacity: 0 },
						{ yPercent: 0, opacity: 1, duration: 0.4, ease: "power4.out" },
						0.15
					);
			});

		const reveal = () =>
			new Promise<void>((resolve) => {
				gsap
					.timeline({
						onComplete: () => {
							gsap.set(root, { visibility: "hidden", pointerEvents: "none" });
							gsap.set(panel, { yPercent: 100 });
							resolve();
						},
					})
					.to(labelEl, { yPercent: -110, opacity: 0, duration: 0.25, ease: "power3.in" })
					.to(panel, { yPercent: -100, duration: 0.55, ease: "power3.inOut" }, 0.1)
					// The new page's entrances play as the panel lifts off it.
					.call(() => markPageReady("curtain"), [], 0.2);
			});

		const navigate = async (
			path: string,
			hash: string,
			pop?: { url: string; as: string; options: Record<string, unknown> }
		) => {
			if (busy) {
				// Pops are reconciled against the URL once the current one lands.
				if (!pop) queued = { path, hash };
				return;
			}
			busy = true;
			savedScroll.set(currentIdx, window.scrollY);
			setLabel({ name: labelFor(path), path });
			resetPageReady();
			getLenis()?.stop();
			if (safety) clearTimeout(safety);
			safety = setTimeout(() => {
				// Never leave the site covered if something upstream hangs.
				busy = false;
				getLenis()?.start();
				reveal();
			}, 6000);

			await cover(!!pop);
			try {
				if (pop) {
					await Router.replace(pop.url, pop.as, { ...pop.options, scroll: false });
				} else {
					await Router.push(path, undefined, { scroll: false });
				}
			} catch {
				/* a failed chunk makes Next hard-navigate; nothing to do */
			}
			await settled();
			ScrollTrigger.refresh();
			currentIdx = historyIdx();

			if (hash) {
				scrollToTarget(hash, { immediate: true });
				window.history.replaceState(window.history.state, "", `${path}#${hash}`);
			} else if (pop && savedScroll.has(currentIdx)) {
				const y = savedScroll.get(currentIdx) ?? 0;
				window.scrollTo(0, y);
				getLenis()?.scrollTo(y, { immediate: true, force: true });
			} else {
				jumpToTop();
			}

			getLenis()?.start();
			if (safety) clearTimeout(safety);
			await reveal();
			busy = false;

			const next = queued;
			queued = null;
			const shown = Router.asPath.split(/[?#]/)[0];
			if (window.location.pathname !== shown) {
				// Back/forward pressed mid-transition: the URL moved on without us.
				const p = window.location.pathname;
				navigate(p, "", { url: p, as: p, options: {} });
			} else if (next && next.path !== shown) {
				navigate(next.path, next.hash);
			}
		};

		const onClick = (e: MouseEvent) => {
			if (e.defaultPrevented || e.button !== 0) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			const target = e.target as Element | null;
			const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
			if (!a) return;
			if (a.target && a.target !== "_self") return;
			if (a.hasAttribute("download") || a.hasAttribute("data-no-transition")) return;

			const url = new URL(a.href, window.location.href);
			if (url.origin !== window.location.origin) return;
			if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return; // resume PDF etc.

			if (url.pathname.startsWith("/myarticle")) {
				// Redirected to Substack server-side (next.config.js 308).
				e.preventDefault();
				window.location.assign(url.href);
				return;
			}

			e.preventDefault();
			const hash = decodeURIComponent(url.hash.slice(1));

			if (url.pathname === window.location.pathname) {
				if (!hash || hash === "home" || hash === "top") {
					scrollToTarget(0);
					window.history.replaceState(window.history.state, "", url.pathname);
				} else {
					scrollToTarget(hash);
					window.history.replaceState(window.history.state, "", `${url.pathname}#${hash}`);
				}
				return;
			}

			navigate(url.pathname + url.search, hash === "home" ? "" : hash);
		};

		Router.beforePopState(({ url, as, options }) => {
			const [asPath, hash = ""] = as.split("#");
			// Router.asPath is still the page on screen (we return false below).
			if (Router.asPath.split("#")[0] === asPath) {
				// Same page, different hash.
				scrollToTarget(hash ? hash : 0);
				return false;
			}
			navigate(asPath, hash, { url, as: asPath, options: options as Record<string, unknown> });
			return false;
		});

		const onPageShow = (e: PageTransitionEvent) => {
			// Restored from the back/forward cache mid-transition.
			if (!e.persisted) return;
			busy = false;
			gsap.killTweensOf([panel, labelEl]);
			gsap.set(root, { visibility: "hidden", pointerEvents: "none" });
			gsap.set(panel, { yPercent: 100 });
			getLenis()?.start();
			markPageReady("direct");
		};

		document.addEventListener("click", onClick, true);
		window.addEventListener("pageshow", onPageShow);
		return () => {
			document.removeEventListener("click", onClick, true);
			window.removeEventListener("pageshow", onPageShow);
			Router.beforePopState(() => true);
			if (safety) clearTimeout(safety);
		};
	}, []);

	return (
		<div
			ref={rootRef}
			aria-hidden="true"
			className="fixed inset-0 z-200 overflow-hidden"
			style={{ visibility: "hidden", pointerEvents: "none" }}
		>
			<div ref={panelRef} className="absolute inset-0 bg-canvas will-change-transform">
				{/* Light leaks on both edges: the top leads on cover, the
				    bottom trails on reveal. */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
				<div
					className="absolute inset-x-0 -top-24 h-24 opacity-60"
					style={{
						background:
							"radial-gradient(60% 100% at 50% 100%, rgb(var(--accent) / 0.35), transparent 70%)",
					}}
				/>
				<div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-soft to-transparent" />
				<div
					className="absolute inset-0"
					style={{
						background:
							"radial-gradient(90% 70% at 50% 110%, rgb(var(--accent) / 0.16), transparent 60%)",
					}}
				/>
				<div className="absolute inset-0 grid place-items-center px-6">
					<div className="overflow-hidden pb-[0.12em] text-center">
						<div ref={labelRef} className="will-change-transform">
							<p className="mono-label mb-4">
								<span className="text-accent-soft">→</span> {label.path}
							</p>
							<p className="type-display title-silver mx-auto">{label.name}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransitionController;
