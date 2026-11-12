import { CERTIFICATES } from "../../constants";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { IDesktop } from "pages";
import { initHeadingWipe, prefersReducedMotion } from "../../utils/motion";

const CERTIFICATE_STYLES = {
	SECTION:
		"w-full relative select-none mb-12 section-container py-8 md:py-12 flex flex-col justify-center",
};

const CertificateSection = ({ isDesktop }: IDesktop) => {
	const targetSection = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!targetSection.current) return;

		const triggers: (ScrollTrigger | null)[] = [initHeadingWipe(targetSection.current)];

		const cards = targetSection.current.querySelectorAll(".cert-card");
		if (cards.length && !prefersReducedMotion()) {
			gsap.set(cards, {
				opacity: 0,
				y: 50,
				rotateX: 8,
				transformOrigin: "center bottom",
				transformPerspective: 800,
			});

			triggers.push(
				ScrollTrigger.create({
					trigger: targetSection.current.querySelector(".certificate-wrapper"),
					start: "top 80%",
					once: true,
					onEnter: () => {
						gsap.to(cards, {
							opacity: 1,
							y: 0,
							rotateX: 0,
							duration: 0.8,
							ease: "back.out(1.4)",
							stagger: 0.12,
						});
					},
				})
			);
		}

		return () => triggers.forEach((t) => t?.kill());
	}, []);

	const renderSectionTitle = (): React.ReactNode => (
		<div className="flex flex-col">
			<h2 className="section-heading">My certifications</h2>
			<h3 className="text-2xl md:max-w-2xl w-full mt-2">
				Professional certifications that validate my expertise
			</h3>
		</div>
	);

	const renderCertificate = (cert: typeof CERTIFICATES[number]): React.ReactNode => (
		<div key={cert.name} className="cert-card group h-full">
			<div className="card-shine h-full flex flex-col rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-xl overflow-hidden hover:border-[#9146FF]/30 hover:bg-gray-800/70 hover:shadow-[0_0_30px_-5px_rgba(145,70,255,0.2)] hover:-translate-y-2 transition-all duration-[10ms]">
				{/* Uniform white "stage" so badges/certificates of any shape read consistently */}
				<div className="p-4">
					<div className="h-52 md:h-56 w-full rounded-xl bg-white flex items-center justify-center p-5 overflow-hidden">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={`/skills/3rd/${cert.image}.webp`}
							alt={cert.name}
							loading="lazy"
							decoding="async"
							className="object-contain max-w-full max-h-full"
						/>
					</div>
				</div>
				<div className="mt-auto px-5 py-4 border-t border-gray-700/50 text-left">
					<p className="text-white font-bold">{cert.name}</p>
					<span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#9146FF]/10 text-[#BF94FF] border border-[#9146FF]/20">
						{cert.issuer}
					</span>
				</div>
			</div>
		</div>
	);

	return (
		<section className="relative">
			<div
				className={CERTIFICATE_STYLES.SECTION}
				id="certificates"
				ref={targetSection}
			>
				<div className="flex flex-col certificate-wrapper">
					{renderSectionTitle()}
					<div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mt-10 gap-8 lg:gap-10">
						{CERTIFICATES.map(renderCertificate)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default CertificateSection;
