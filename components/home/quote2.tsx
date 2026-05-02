import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import type Typed from "typed.js";
import { QUOTE_STRINGS } from "../../constants";

const QuoteSection2 = () => {
	const typedRef = useRef<HTMLSpanElement>(null);
	const targetSection = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const typedInstance = useRef<Typed | null>(null);

	useEffect(() => {
		if (!targetSection.current) return;

		const trigger = ScrollTrigger.create({
			trigger: targetSection.current,
			start: "top 80%",
			onEnter: () => setIsVisible(true),
			once: true,
		});

		return () => trigger.kill();
	}, []);

	useEffect(() => {
		if (!isVisible || !typedRef.current) return;

		let cancelled = false;
		import("typed.js").then(({ default: Typed }) => {
			if (cancelled || !typedRef.current) return;
			typedInstance.current = new Typed(typedRef.current, {
				strings: QUOTE_STRINGS,
				typeSpeed: 40,
				backSpeed: 25,
				backDelay: 4000,
				contentType: 'html',
				loop: true,
			});
		});

		return () => {
			cancelled = true;
			typedInstance.current?.destroy();
		};
	}, [isVisible]);

	return (
		<section className="w-full relative select-none" ref={targetSection}>
			<div className="py-16 sm:py-24 md:py-36 tall:py-30 section-container">
				<div className="text-center">
					<p className="font-medium text-3xl md:text-5xl min-h-[1.5em]">
						<span ref={typedRef}></span>
					</p>
					<p className="mt-4 text-xl md:text-2xl text-gray-400">
						scroll down and <span className="text-[#BF94FF] font-bold">see for yourself</span>
					</p>
				</div>
			</div>
		</section>
	);
};

export default QuoteSection2;
