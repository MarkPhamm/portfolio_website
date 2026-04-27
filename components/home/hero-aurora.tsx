import React, { forwardRef } from "react";

const AURORA_BLOBS = [
	{
		color: "rgba(145, 70, 255, 0.18)",
		width: "45%",
		height: "50%",
		top: "5%",
		left: "-5%",
		blur: 60,
		animationClass: "aurora-drift-1",
	},
	{
		color: "rgba(191, 148, 255, 0.14)",
		width: "40%",
		height: "45%",
		top: "30%",
		left: "55%",
		blur: 70,
		animationClass: "aurora-drift-2",
	},
	{
		color: "rgba(6, 182, 212, 0.10)",
		width: "35%",
		height: "40%",
		top: "55%",
		left: "20%",
		blur: 55,
		animationClass: "aurora-drift-3",
	},
];

const HeroAurora = forwardRef<HTMLDivElement>((_, ref) => {
	return (
		<div
			ref={ref}
			className="absolute inset-0 overflow-hidden pointer-events-none"
			style={{ zIndex: 0 }}
			aria-hidden="true"
		>
			{AURORA_BLOBS.map((blob, i) => (
				<div
					key={i}
					className={`absolute rounded-full aurora-blob ${blob.animationClass}`}
					style={{
						width: blob.width,
						height: blob.height,
						top: blob.top,
						left: blob.left,
						background: `radial-gradient(ellipse at center, ${blob.color} 0%, transparent 70%)`,
						filter: `blur(${blob.blur}px)`,
					}}
				/>
			))}
			{/* Subtle noise overlay for texture */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
					backgroundRepeat: "repeat",
					backgroundSize: "256px 256px",
				}}
			/>
		</div>
	);
});

HeroAurora.displayName = "HeroAurora";

export default HeroAurora;
