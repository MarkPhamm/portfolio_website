import { COMMENTS } from "../../constants";
import React, { useEffect, useState, useCallback } from "react";
import { IDesktop } from "pages";
import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from "react-icons/fa";
import Image from "next/image";
import { trackEvent } from "../../utils/clarity";

const getTextSize = (length: number): string => {
	if (length < 200) return "text-xl md:text-2xl";
	if (length < 300) return "text-base md:text-lg";
	if (length < 400) return "text-sm md:text-base";
	return "text-xs md:text-sm";
};

const CommentTile = (props: {
	text: string;
	currentPosition: string;
	authorName: string;
	avatar: string;
	isActive: boolean;
}) => {
	const textSize = getTextSize(props.text.length);

	return (
		<div
			className={`transition-all duration-[10ms] ${props.isActive
					? "opacity-100 translate-x-0 scale-100"
					: "opacity-0 translate-x-8 scale-[0.98]"
				}`}
			style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
		>
			<div className={`relative p-5 sm:p-8 md:p-10 mx-auto max-w-3xl min-h-[380px] sm:min-h-[440px] md:min-h-[520px] flex flex-col justify-center rounded-2xl border transition-all duration-[10ms] overflow-hidden ${props.isActive
					? "bg-gray-900/90 backdrop-blur-sm border-[#9146FF]/30 shadow-lg shadow-[#9146FF]/5"
					: "bg-gray-900 border-gray-800"
				}`}>
				<FaQuoteLeft className="absolute top-4 left-6 text-6xl text-[#9146FF] opacity-10" />

				<div className="flex flex-col">
					<div className="flex justify-center mb-6">
						<Image
							src={props.avatar}
							alt={props.authorName}
							width={128}
							height={128}
							className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#9146FF]/30 shadow-lg shadow-[#9146FF]/10 object-cover"
							loading="eager"
						/>
					</div>

					<p className={`${textSize} text-gray-200 leading-relaxed mb-8 italic text-left`}>
						"{props.text}"
					</p>

					<div className="text-right self-end">
						<p className="text-lg font-bold text-white">{props.authorName}</p>
						<p className="text-sm text-gray-400">{props.currentPosition}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const CommentSection = ({ }: IDesktop) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	const totalSlides = COMMENTS.length;

	const goToNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % totalSlides);
	}, [totalSlides]);

	const goToPrev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
	}, [totalSlides]);

	const goToSlide = useCallback((index: number) => {
		setCurrentIndex(index);
	}, []);

	const handleNav = (direction: "prev" | "next" | "dot", slide?: number) => {
		trackEvent("testimonial_nav", { direction, ...(slide !== undefined && { slide }) });
	};

	// Auto-play functionality
	useEffect(() => {
		if (isPaused) return;

		const interval = setInterval(() => {
			goToNext();
		}, 6000); // Change slide every 6 seconds

		return () => clearInterval(interval);
	}, [isPaused, goToNext]);

	return (
		<section
			className="w-full relative select-none section-container flex-col flex py-8 md:py-12 justify-center"
			id="comments"
		>
			<div className="flex flex-col inner-container">
				<h1 className="section-heading seq">What Others Say</h1>
				<h2 className="text-2xl md:max-w-2xl w-full seq mt-2 mb-8">
					Proof I'm not just making this up
				</h2>

				{/* Carousel Container with Navigation */}
				<div
					className="relative"
					onMouseEnter={() => setIsPaused(true)}
					onMouseLeave={() => setIsPaused(false)}
					onKeyDown={(e) => {
						if (e.key === "ArrowLeft") goToPrev();
						if (e.key === "ArrowRight") goToNext();
					}}
					tabIndex={0}
					role="region"
					aria-label="Testimonial carousel"
				>
					{/* Navigation Arrows */}
					<button
						onClick={() => { handleNav("prev"); goToPrev(); }}
						className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-[10ms] shadow-lg"
						aria-label="Previous testimonial"
					>
						<FaChevronLeft className="text-lg" />
					</button>

					<button
						onClick={() => { handleNav("next"); goToNext(); }}
						className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-[10ms] shadow-lg"
						aria-label="Next testimonial"
					>
						<FaChevronRight className="text-lg" />
					</button>

					{/* Slides Container */}
					<div className="relative mb-4 overflow-hidden">
						{COMMENTS.map((comment, index) => (
							<div
								key={index}
								className={index === currentIndex ? "relative" : "absolute inset-0 pointer-events-none"}
							>
								<CommentTile
									text={comment.comment}
									authorName={comment.author}
									currentPosition={comment.position}
									avatar={comment.avatar}
									isActive={index === currentIndex}
								/>
							</div>
						))}
					</div>
				</div>

				{/* Mobile Navigation Arrows */}
				<div className="flex md:hidden justify-center gap-4 mt-4">
					<button
						onClick={() => { handleNav("prev"); goToPrev(); }}
						className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-[10ms] shadow-lg"
						aria-label="Previous testimonial"
					>
						<FaChevronLeft className="text-lg" />
					</button>
					<button
						onClick={() => { handleNav("next"); goToNext(); }}
						className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-[10ms] shadow-lg"
						aria-label="Next testimonial"
					>
						<FaChevronRight className="text-lg" />
					</button>
				</div>

				{/* Slide Counter */}
				<div className="text-center text-sm text-gray-400 mt-4">
					{currentIndex + 1} / {totalSlides}
				</div>

				{/* Navigation Dots */}
				<div className="flex justify-center gap-3 mt-3">
					{COMMENTS.map((_, index) => (
						<button
							key={index}
							onClick={() => { handleNav("dot", index); goToSlide(index); }}
							className={`w-3.5 h-3.5 rounded-full transition-all duration-[10ms] ${index === currentIndex
									? "bg-[#9146FF] w-10"
									: "bg-gray-600 hover:bg-gray-500"
								}`}
							aria-label={`Go to testimonial ${index + 1}`}
						/>
					))}
				</div>

				{/* Progress Bar */}
				<div className="mt-4 max-w-md mx-auto w-full">
					<div className="h-1 bg-gray-800 rounded-full overflow-hidden">
						<div
							className="h-full bg-[#9146FF] transition-all duration-[10ms] ease-out"
							style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
						/>
					</div>
				</div>

				<div className="mt-6 flex justify-center">
					<a
						href="https://drive.google.com/file/d/1EyMtIZU1_ohN9i2lJ7sGvAiPnxX7vVAv/view?usp=sharing"
						className="text-[#9146FF] text-md underline hover:text-white transition-colors"
						target="_blank"
						rel="noreferrer"
						onClick={() => trackEvent("recommendations_click")}
					>
						View all recommendations &rarr;
					</a>
				</div>
			</div>
		</section>
	);
};

export default CommentSection;
