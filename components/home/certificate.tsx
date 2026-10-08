import { CERTIFICATES } from "../../constants";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { IDesktop } from "pages";
import { EASE, prefersReducedMotion } from "../../utils/motion";
import SectionHeader from "../common/section-header";

const CERTIFICATE_STYLES = {
	SECTION:
		"w-full relative select-none section-container py-24 md:py-36 flex flex-col justify-center",
};

const CertificateSection = ({ isDesktop }: IDesktop) => {
	const targetSection = useRef<HTMLDivElement>(null);

	// Cards tip up into place (slight rotateX), staggered, no overshoot.
	useEffect(() => {
		if (!targetSection.current) return;
		const cards = targetSection.current.querySelectorAll(".cert-card");
		if (!cards.length || prefersReducedMotion()) return;

		gsap.set(cards, {
			opacity: 0,
			y: 40,
			rotateX: 8,
			transformOrigin: "center bottom",
			transformPerspective: 800,
		});
		const trigger = ScrollTrigger.create({
			trigger: targetSection.current.querySelector(".certificate-grid"),
			start: "top 85%",
			once: true,
			onEnter: () => {
				gsap.to(cards, {
					opacity: 1,
					y: 0,
					rotateX: 0,
					duration: 0.7,
					ease: EASE.out,
					stagger: 0.06,
				});
			},
		});
		return () => trigger.kill();
	}, []);

	const renderCertificate = (cert: typeof CERTIFICATES[number]): React.ReactNode => (
		<div key={cert.name} className="cert-card group h-full">
			<div className="card-shine flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface-1/60 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-colors duration-[10ms] hover:border-line-strong">
				{/* Light mat so badges/certificates of any shape read consistently */}
				<div className="flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#f5f4f7] to-[#dad8e0] p-6 md:h-56">
					<img
						src={`/skills/3rd/${cert.image}.webp`}
						alt={cert.name}
						loading="lazy"
						decoding="async"
						className="object-contain max-w-full max-h-full"
					/>
				</div>
				<div className="mt-auto px-2 pb-1 pt-5 text-left">
					<p className="text-lg font-normal tracking-[-0.01em] text-ink-1">{cert.name}</p>
					<p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
						{cert.issuer}
					</p>
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
				<SectionHeader
					index="09"
					eyebrow="Certifications"
					title="My certifications"
					tagline="Professional certifications that validate my expertise"
					className="mb-12 md:mb-16"
				/>
				<div className="certificate-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
					{CERTIFICATES.map(renderCertificate)}
				</div>
			</div>
		</section>
	);
};

export default CertificateSection;
