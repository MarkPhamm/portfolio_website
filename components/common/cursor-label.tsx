import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MQ, prefersReducedMotion } from "../../utils/motion";

/**
 * Contextual cursor label. The native pointer always stays (v3.8.20 removed
 * the old dot/ring cursor on purpose); this only adds a small glass tag —
 * "View", "Read" — that trails the pointer while it's over an element with
 * `data-cursor-label`. Shows/hides instantly (10ms hover rule); only the
 * follow is eased. Mouse/trackpad only, off under reduced motion.
 */
const CursorLabel = () => {
	const rootRef = useRef<HTMLDivElement>(null);
	const [text, setText] = useState("");

	useEffect(() => {
		const root = rootRef.current;
		if (!root || prefersReducedMotion() || !window.matchMedia(MQ.fine).matches) return;

		const xTo = gsap.quickTo(root, "x", { duration: 0.25, ease: "power3" });
		const yTo = gsap.quickTo(root, "y", { duration: 0.25, ease: "power3" });
		let current: Element | null = null;
		let lastX = -1;
		let lastY = -1;
		let settle: ReturnType<typeof setTimeout> | undefined;

		const update = (el: Element | null) => {
			const host = el?.closest?.("[data-cursor-label]") ?? null;
			if (host === current) return;
			current = host;
			if (host) {
				setText(host.getAttribute("data-cursor-label") ?? "");
				root.style.opacity = "1";
			} else {
				root.style.opacity = "0";
			}
		};

		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			if (lastX < 0) gsap.set(root, { x: e.clientX, y: e.clientY });
			lastX = e.clientX;
			lastY = e.clientY;
			xTo(e.clientX);
			yTo(e.clientY);
			update(e.target as Element);
		};

		// Scrolling moves content under a still pointer: hide the tag while
		// scrolling, re-check what's under the pointer once it settles (one
		// hit-test per scroll gesture instead of one per frame).
		const onScroll = () => {
			if (lastX < 0) return;
			if (current) {
				current = null;
				root.style.opacity = "0";
			}
			if (settle) clearTimeout(settle);
			settle = setTimeout(() => update(document.elementFromPoint(lastX, lastY)), 120);
		};

		const hide = () => {
			current = null;
			root.style.opacity = "0";
		};

		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("scroll", onScroll, { passive: true });
		document.documentElement.addEventListener("pointerleave", hide);
		window.addEventListener("blur", hide);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("scroll", onScroll);
			document.documentElement.removeEventListener("pointerleave", hide);
			window.removeEventListener("blur", hide);
			if (settle) clearTimeout(settle);
		};
	}, []);

	return (
		<div
			ref={rootRef}
			aria-hidden="true"
			className="pointer-events-none fixed left-0 top-0 z-400"
			style={{ opacity: 0 }}
		>
			<span className="glass ml-4 mt-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-1 shadow-[0_8px_30px_-8px_rgb(0_0_0/0.6)]">
				{text}
				<span className="text-accent-soft">↗</span>
			</span>
		</div>
	);
};

export default CursorLabel;
