import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { TESTIMONIAL_THEMES, ITestimonialTheme } from "../../../constants";
import { trackEvent } from "../../../utils/clarity";
import { prefersReducedMotion } from "../../../utils/motion";
import { FILE_BY_AUTHOR, ITestimonialFile } from "./files";

gsap.registerPlugin(ScrollTrigger);

// The "common threads" strip that lived above the old carousel — kept running
// above the IDE window. Clicking a theme now opens that reviewer's file in the
// editor; repeat clicks cycle through the theme's reviewers.
const ThreadsMarquee = ({
	activeAuthor,
	onOpen,
}: {
	activeAuthor: string | null; // raw "First, Last" of the open file
	onOpen: (file: ITestimonialFile) => void;
}) => {
	const stripRef = useRef<HTMLDivElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	// True right after a drag so the click that follows pointerup doesn't
	// trigger a theme jump
	const draggedRef = useRef(false);
	// Per-theme cycle position, so repeated clicks step through each reviewer
	// who mentioned that theme.
	const cycleRef = useRef<Record<string, number>>({});

	const handleTheme = (theme: ITestimonialTheme) => {
		const pos =
			((cycleRef.current[theme.label] ?? -1) + 1) % theme.authors.length;
		cycleRef.current[theme.label] = pos;
		const file = FILE_BY_AUTHOR[theme.authors[pos]];
		if (!file) return;
		trackEvent("testimonial_theme_click", { theme: theme.label });
		onOpen(file);
	};

	// Strip fades/rises in as a whole on scroll-in
	useEffect(() => {
		if (prefersReducedMotion() || !stripRef.current) return;
		gsap.set(stripRef.current, { opacity: 0, y: 24 });
		const trigger = ScrollTrigger.create({
			trigger: stripRef.current,
			start: "top 85%",
			once: true,
			onEnter: () => {
				gsap.to(stripRef.current, {
					opacity: 1,
					y: 0,
					duration: 0.7,
					ease: "power2.out",
				});
			},
		});
		return () => trigger.kill();
	}, []);

	// Marquee driver: rAF advances an offset (left→right drift) that the user
	// can also grab-and-drag or horizontally swipe. The track holds two copies
	// of the cards, so the offset wraps seamlessly at half the track width.
	// Skipped under reduced motion (CSS falls back to a native scroller).
	useEffect(() => {
		const wrap = wrapRef.current;
		const track = trackRef.current;
		if (!wrap || !track || prefersReducedMotion()) return;

		const LOOP_SECONDS = 45;
		let half = track.scrollWidth / 2;
		let offset = 0;
		let hovered = false;
		let focused = false;
		let dragging = false;
		let startX = 0;
		let startOffset = 0;
		let last: number | null = null;
		let raf = 0;

		const tick = (now: number) => {
			if (last !== null && !hovered && !focused && !dragging) {
				// Clamp dt so a background tab doesn't cause a jump on return
				const dt = Math.min((now - last) / 1000, 0.1);
				offset += dt * (half / LOOP_SECONDS);
			}
			last = now;
			const x = -half + (((offset % half) + half) % half);
			track.style.transform = `translateX(${x}px)`;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		const onResize = () => {
			half = track.scrollWidth / 2;
		};
		const onPointerDown = (e: PointerEvent) => {
			if (e.pointerType === "mouse" && e.button !== 0) return;
			dragging = true;
			draggedRef.current = false;
			startX = e.clientX;
			startOffset = offset;
			wrap.classList.add("is-dragging");
		};
		const onPointerMove = (e: PointerEvent) => {
			if (!dragging) return;
			const dx = e.clientX - startX;
			if (Math.abs(dx) > 5) draggedRef.current = true;
			offset = startOffset + dx;
		};
		const endDrag = () => {
			dragging = false;
			wrap.classList.remove("is-dragging");
		};
		const onWheel = (e: WheelEvent) => {
			// Only claim mostly-horizontal wheel/trackpad gestures
			if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
			e.preventDefault();
			offset -= e.deltaX;
		};
		const onEnter = () => (hovered = true);
		const onLeave = () => (hovered = false);
		const onFocusIn = () => (focused = true);
		const onFocusOut = () => (focused = false);

		wrap.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", endDrag);
		window.addEventListener("pointercancel", endDrag);
		wrap.addEventListener("wheel", onWheel, { passive: false });
		wrap.addEventListener("mouseenter", onEnter);
		wrap.addEventListener("mouseleave", onLeave);
		wrap.addEventListener("focusin", onFocusIn);
		wrap.addEventListener("focusout", onFocusOut);
		window.addEventListener("resize", onResize);

		return () => {
			cancelAnimationFrame(raf);
			wrap.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", endDrag);
			window.removeEventListener("pointercancel", endDrag);
			wrap.removeEventListener("wheel", onWheel);
			wrap.removeEventListener("mouseenter", onEnter);
			wrap.removeEventListener("mouseleave", onLeave);
			wrap.removeEventListener("focusin", onFocusIn);
			wrap.removeEventListener("focusout", onFocusOut);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	const renderThemeCard = (theme: ITestimonialTheme, isClone: boolean) => {
		const mentionedByCurrent =
			activeAuthor !== null && theme.authors.includes(activeAuthor);
		return (
			<button
				key={`${theme.label}${isClone ? "-clone" : ""}`}
				onClick={() => handleTheme(theme)}
				tabIndex={isClone ? -1 : 0}
				className={`theme-card flex-shrink-0 w-64 text-left p-4 rounded-2xl border backdrop-blur-sm transition-all duration-[10ms] ${
					mentionedByCurrent
						? "bg-gray-800/80 border-[#9146FF]/60 shadow-lg shadow-[#9146FF]/10"
						: "bg-gray-800/50 border-gray-700/50 hover:border-[#9146FF]/40 hover:bg-gray-800/70"
				}`}
			>
				<span className="block text-sm font-semibold text-white">
					{theme.label}
				</span>
				<p className="text-xs text-gray-400 mt-1.5 leading-relaxed min-h-[2.4375rem]">
					{theme.blurb}
				</p>
				<div className="flex mt-3 -space-x-2">
					{theme.authors.map((author) => {
						const person = FILE_BY_AUTHOR[author];
						if (!person) return null;
						const isCurrent = author === activeAuthor;
						return (
							<Image
								key={author}
								src={person.avatar}
								alt={person.displayName}
								width={28}
								height={28}
								className={`w-7 h-7 rounded-full object-cover border-2 ${
									isCurrent ? "border-[#9146FF]" : "border-gray-900"
								}`}
								loading="lazy"
							/>
						);
					})}
				</div>
			</button>
		);
	};

	return (
		<div className="mb-10" ref={stripRef}>
			<p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
				Common threads · click to open who said it
			</p>
			<div
				className="theme-marquee-wrap relative overflow-hidden"
				ref={wrapRef}
				onClickCapture={(e) => {
					// A drag ends with a click on whatever card is under the
					// pointer — swallow it so dragging never opens a file
					if (draggedRef.current) {
						e.preventDefault();
						e.stopPropagation();
						draggedRef.current = false;
					}
				}}
			>
				<div className="theme-marquee-track flex w-max py-1" ref={trackRef}>
					<div className="flex gap-3 pr-3">
						{TESTIMONIAL_THEMES.map((theme) => renderThemeCard(theme, false))}
					</div>
					<div className="flex gap-3 pr-3" aria-hidden="true">
						{TESTIMONIAL_THEMES.map((theme) => renderThemeCard(theme, true))}
					</div>
				</div>
				{/* Edge fades into the page background */}
				<div
					className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-900 to-transparent"
					aria-hidden="true"
				></div>
				<div
					className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-900 to-transparent"
					aria-hidden="true"
				></div>
			</div>
		</div>
	);
};

export default ThreadsMarquee;
