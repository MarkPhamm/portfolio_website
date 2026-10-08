import React, { useEffect, useRef, useState } from "react";
import { READS_LAST_UPDATED } from "../../constants";
import { trackEvent } from "../../utils/clarity";
import { scrollToTarget } from "../../utils/scroll";

// Classes applied to a random card by the "Surprise me" chip, then removed.
// Kept as full literal strings so Tailwind's scanner generates them.
const PULSE_CLASSES = [
	"ring-2",
	"ring-[#9146FF]",
	"ring-offset-2",
	"ring-offset-gray-900",
];

// Typographic, photo-free hero for the Reads page. Mirrors the entrance
// choreography of the Passion page hero (PassionComponent → PassionHero) — a
// staggered fade/translate-up driven by a `loaded` flag — but keeps the site's
// default purple theme and needs no background image. A soft purple glow sits
// behind the text so the dark hero reads as deliberate rather than empty.
const ReadsHero = () => {
	const [loaded, setLoaded] = useState(false);
	const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setLoaded(true), 100);
		return () => {
			clearTimeout(timer);
			if (pulseTimer.current) clearTimeout(pulseTimer.current);
		};
	}, []);

	// Scroll to a random card (any section) and pulse a purple ring on it —
	// the data-engineer answer to "where do I start?".
	const surpriseMe = () => {
		const cards = document.querySelectorAll<HTMLElement>("[data-read-card]");
		if (!cards.length) return;
		const pick = cards[Math.floor(Math.random() * cards.length)];

		cards.forEach((c) => c.classList.remove(...PULSE_CLASSES));
		// Through the scroll helper so Lenis (when running) owns the motion.
		scrollToTarget(pick, { offset: -(window.innerHeight - pick.getBoundingClientRect().height) / 2 });
		pick.classList.add(...PULSE_CLASSES);

		if (pulseTimer.current) clearTimeout(pulseTimer.current);
		pulseTimer.current = setTimeout(
			() => pick.classList.remove(...PULSE_CLASSES),
			1600
		);

		trackEvent("reads_shuffle");
	};

	const reveal = (delay: string) =>
		`transition-all duration-1000 ${delay} ${
			loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
		}`;

	return (
		<section
			className="w-full relative select-none section-container pt-32 md:pt-40 pb-14 md:pb-20 overflow-hidden"
			id="reads-hero"
		>
			{/* Decorative purple glow — pure depth, hidden from a11y tree */}
			<div
				aria-hidden
				className="pointer-events-none absolute -top-24 -left-16 w-[28rem] h-[28rem] rounded-full bg-[#9146FF]/20 blur-[120px]"
			/>

			<div className="relative z-10 flex flex-col">
				<p
					className={`text-[#BF94FF] text-sm md:text-base font-medium tracking-[0.25em] uppercase mb-4 ${reveal(
						"delay-200"
					)}`}
				>
					Off the Clock
				</p>
				<h1
					className={`text-gradient w-fit font-bold leading-[1.1] pb-1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl ${reveal(
						"delay-300"
					)}`}
				>
					What I&apos;m Reading
				</h1>
				<div
					className={`h-1 mt-6 rounded-full bg-gradient-to-r from-[#9146FF] to-[#BF94FF] transition-[width,opacity] duration-700 delay-500 ease-out ${
						loaded ? "w-24 opacity-100" : "w-0 opacity-0"
					}`}
				/>
				<p
					className={`text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl mt-7 ${reveal(
						"delay-700"
					)}`}
				>
					The blogs, essays, and ideas I keep coming back to — from data
					engineering to philosophy and the gloriously unconventional.
				</p>
				<div
					className={`flex flex-wrap items-center gap-x-5 gap-y-3 mt-8 ${reveal(
						"delay-1000"
					)}`}
				>
					<button
						type="button"
						onClick={surpriseMe}
						className="font-mono text-sm text-[#BF94FF] bg-[#9146FF]/10 border border-[#9146FF]/30 rounded-lg px-4 py-2 hover:border-[#9146FF]/60 hover:bg-[#9146FF]/20 transition-all duration-[10ms]"
					>
						<span aria-hidden>🎲 </span>$ shuf reads.txt -n 1
					</button>
					<span className="text-xs uppercase tracking-[0.15em] text-gray-500">
						Last updated {READS_LAST_UPDATED}
					</span>
				</div>
			</div>
		</section>
	);
};

export default ReadsHero;
