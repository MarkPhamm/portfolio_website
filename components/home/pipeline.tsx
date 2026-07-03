import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { MotionPathPlugin } from "gsap/dist/MotionPathPlugin";
import { isSmallScreen, NO_MOTION_PREFERENCE_QUERY } from "pages";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// Row centers and column geometry for the DAG.
const ROW = { top: 170, mid: 315, bottom: 460 };

interface NodeProps {
	x: number;
	y: number;
	w: number;
	h: number;
	label: string;
	name: string;
	led?: boolean;
}

const Node = ({ x, y, w, h, label, name, led = true }: NodeProps) => (
	<g className="pl-node" data-name={name}>
		<rect
			x={x - 3}
			y={y - 3}
			width={w + 6}
			height={h + 6}
			rx={13}
			fill="none"
			stroke="#9146FF"
			strokeOpacity={0.12}
			strokeWidth={1.5}
		/>
		<rect
			x={x}
			y={y}
			width={w}
			height={h}
			rx={10}
			fill="rgba(17, 24, 39, 0.65)"
			stroke="#9146FF"
			strokeOpacity={0.55}
			strokeWidth={1.5}
		/>
		{led && <circle cx={x + 14} cy={y + h / 2} r={2.5} fill="#34D399" opacity={0.85} />}
		<text
			x={x + w / 2 + (led ? 5 : 0)}
			y={y + h / 2 + 4.5}
			textAnchor="middle"
			fill="#D1D5DB"
			fontSize={14}
			fontFamily={MONO_FONT}
			className="pl-label hidden md:block"
		>
			{label}
		</text>
	</g>
);

const ColumnHeading = ({ x, label }: { x: number; label: string }) => (
	<text
		x={x}
		y={84}
		textAnchor="middle"
		fill="#6B7280"
		fontSize={11}
		letterSpacing={2}
		fontFamily={MONO_FONT}
		className="pl-label hidden md:block"
	>
		{label.toUpperCase()}
	</text>
);

// Edge paths in flow order. Packet index i rides edge index i.
const EDGES = [
	`M154,${ROW.top} C186,${ROW.top} 202,${ROW.top} 234,${ROW.top}`,
	`M154,${ROW.mid} C186,${ROW.mid} 202,${ROW.mid} 234,${ROW.mid}`,
	`M154,${ROW.bottom} C186,${ROW.bottom} 202,${ROW.bottom} 234,${ROW.bottom}`,
	`M346,${ROW.top} C374,${ROW.top} 370,${ROW.mid} 396,${ROW.mid}`,
	`M346,${ROW.mid} C366,${ROW.mid} 376,${ROW.mid} 396,${ROW.mid}`,
	`M346,${ROW.bottom} C374,${ROW.bottom} 370,${ROW.mid} 396,${ROW.mid}`,
	`M504,${ROW.mid} C524,${ROW.mid} 532,${ROW.mid} 552,${ROW.mid}`,
	`M668,${ROW.mid} C692,${ROW.mid} 700,${ROW.mid} 724,${ROW.mid}`,
	`M852,${ROW.mid} C866,${ROW.mid} 874,${ROW.mid} 888,${ROW.mid}`,
];

const BAR_HEIGHTS = [34, 62, 48, 84];

const PipelineDag = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const root = svg.querySelector<SVGGElement>(".pl-root");
		if (!root) return;

		const motionOk = window.matchMedia(NO_MOTION_PREFERENCE_QUERY).matches;
		if (!motionOk) {
			// Reduced motion: show the fully-drawn static DAG, no packets, no loop.
			gsap.set(root, { opacity: 1 });
			return;
		}

		const small = isSmallScreen();
		const edges = Array.from(svg.querySelectorAll<SVGPathElement>(".pl-edge"));
		const packets = Array.from(svg.querySelectorAll<SVGCircleElement>(".pl-packet"));
		const nodes = Array.from(svg.querySelectorAll<SVGGElement>(".pl-node"));
		const labels = svg.querySelectorAll(".pl-label, .pl-ico");
		const boundary = svg.querySelector(".pl-boundary");
		const bars = svg.querySelectorAll(".pl-bar");
		const status = svg.querySelector(".pl-status");

		const nodeByName = (name: string): SVGGElement | undefined =>
			nodes.find((n) => n.dataset.name === name);

		// Prepare the draw-on state before revealing the root (no flash).
		edges.forEach((edge) => {
			const len = edge.getTotalLength();
			gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len });
		});
		gsap.set(root, { opacity: 1 });

		// --- Entrance: edges draw themselves, nodes pop in along the flow.
		// Plays when the section scrolls into view (it sits below the hero). ---
		const entrance = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
		if (boundary) {
			entrance.fromTo(boundary, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
		}
		entrance.to(
			edges,
			{ strokeDashoffset: 0, duration: 0.7, stagger: 0.07, ease: "power1.inOut" },
			0.1
		);
		entrance.fromTo(
			nodes,
			{ scale: 0.6, opacity: 0, transformOrigin: "50% 50%" },
			{ scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.4)", stagger: 0.06 },
			0.15
		);
		entrance.fromTo(labels, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.7);
		if (status) entrance.set(status, { opacity: 0.6 });

		// --- Perpetual loop: one full "pipeline run" per cycle ---
		const loop = gsap.timeline({ repeat: -1, paused: true });

		const runPacket = (edgeIdx: number, at: number, duration: number) => {
			const packet = packets[edgeIdx];
			const edge = edges[edgeIdx];
			if (!packet || !edge) return;
			loop.set(packet, { opacity: 1 }, at);
			loop.to(
				packet,
				{
					motionPath: { path: edge, align: edge, alignOrigin: [0.5, 0.5] },
					duration,
					ease: "none",
				},
				at
			);
			loop.to(packet, { opacity: 0, duration: 0.18 }, at + duration - 0.18);
		};

		const pulse = (name: string, at: number) => {
			if (small) return;
			const node = nodeByName(name);
			if (!node) return;
			loop.to(
				node,
				{
					scale: 1.06,
					duration: 0.18,
					yoyo: true,
					repeat: 1,
					transformOrigin: "50% 50%",
					ease: "power1.inOut",
				},
				at
			);
		};

		// Extraction: sources feed the staging models.
		if (small) {
			runPacket(1, 0, 1.2);
		} else {
			runPacket(0, 0, 1.2);
			runPacket(1, 0.15, 1.2);
			runPacket(2, 0.3, 1.2);
		}
		pulse("stg-orders", 1.2);
		pulse("stg-events", 1.35);
		pulse("stg-users", 1.5);

		// Transformation: staging → intermediate → mart.
		if (small) {
			runPacket(4, 1.7, 1.1);
		} else {
			runPacket(3, 1.7, 1.1);
			runPacket(4, 1.85, 1.1);
			runPacket(5, 2.0, 1.1);
		}
		pulse("int-core", 3.0);
		runPacket(6, 3.2, 0.8);
		pulse("mart-kpis", 4.0);
		if (status) {
			loop.to(status, { opacity: 1, duration: 0.15 }, 4.05);
			loop.to(status, { opacity: 0.6, duration: 0.4 }, 4.5);
		}

		// Load & serve: mart → warehouse → dashboard.
		runPacket(7, 4.3, 0.9);
		pulse("snowflake", 5.2);
		runPacket(8, 5.4, 0.7);
		pulse("dashboard", 6.1);
		if (bars.length) {
			loop.fromTo(
				bars,
				{ scaleY: 0.25, transformOrigin: "50% 100%" },
				{ scaleY: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
				6.15
			);
		}
		// Settle before the next run.
		loop.to({}, { duration: 1.0 }, 6.9);

		let started = false;
		let inView = false;
		entrance.eventCallback("onComplete", () => {
			started = true;
			if (inView) loop.play();
		});
		const entranceTrigger = ScrollTrigger.create({
			trigger: svg,
			start: "top 85%",
			once: true,
			onEnter: () => entrance.play(),
		});
		// Don't burn CPU while the section is off-screen.
		const loopTrigger = ScrollTrigger.create({
			trigger: svg,
			start: "top bottom",
			end: "bottom top",
			onEnter: () => {
				inView = true;
				if (started) loop.play();
			},
			onEnterBack: () => {
				inView = true;
				if (started) loop.play();
			},
			onLeave: () => {
				inView = false;
				loop.pause();
			},
			onLeaveBack: () => {
				inView = false;
				loop.pause();
			},
		});

		return () => {
			entranceTrigger.kill();
			loopTrigger.kill();
			entrance.kill();
			loop.kill();
		};
	}, []);

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 1021 650"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-full h-auto pointer-events-none select-none"
			aria-hidden="true"
		>
			<g className="pl-root" opacity={0}>
				{/* Column headings */}
				<ColumnHeading x={94} label="sources" />
				<ColumnHeading x={445} label="transform" />
				<ColumnHeading x={788} label="warehouse" />
				<ColumnHeading x={947} label="serve" />

				{/* Airflow orchestration boundary around the dbt cluster */}
				<g className="pl-boundary">
					<rect
						x={200}
						y={104}
						width={490}
						height={430}
						rx={20}
						fill="none"
						stroke="#BF94FF"
						strokeOpacity={0.3}
						strokeWidth={1.5}
						strokeDasharray="6 8"
					/>
					<text
						x={224}
						y={134}
						fill="#9CA3AF"
						fontSize={13}
						fontFamily={MONO_FONT}
						className="pl-label hidden md:block"
					>
						airflow · daily @ 06:00
					</text>
					<rect
						x={596}
						y={116}
						width={52}
						height={24}
						rx={12}
						fill="rgba(145, 70, 255, 0.12)"
						stroke="#BF94FF"
						strokeOpacity={0.5}
						strokeWidth={1.2}
					/>
					<text
						x={622}
						y={132.5}
						textAnchor="middle"
						fill="#BF94FF"
						fontSize={13}
						fontFamily={MONO_FONT}
						className="pl-label hidden md:block"
					>
						dbt
					</text>
				</g>

				{/* Edges (flow order — packet i rides edge i) */}
				{EDGES.map((d, i) => (
					<path
						key={i}
						d={d}
						className="pl-edge"
						stroke="#9146FF"
						strokeOpacity={0.3}
						strokeWidth={1.5}
						fill="none"
					/>
				))}

				{/* Source systems */}
				<Node x={28} y={ROW.top - 23} w={126} h={46} label="postgres" name="src-postgres" />
				<Node x={28} y={ROW.mid - 23} w={126} h={46} label="events" name="src-events" />
				<Node x={28} y={ROW.bottom - 23} w={126} h={46} label="s3" name="src-s3" />

				{/* dbt models */}
				<Node x={234} y={ROW.top - 22} w={112} h={44} label="stg_orders" name="stg-orders" />
				<Node x={234} y={ROW.mid - 22} w={112} h={44} label="stg_events" name="stg-events" />
				<Node x={234} y={ROW.bottom - 22} w={112} h={44} label="stg_users" name="stg-users" />
				<Node x={396} y={ROW.mid - 23} w={108} h={46} label="int_core" name="int-core" />
				<Node x={552} y={ROW.mid - 23} w={116} h={46} label="mart_kpis" name="mart-kpis" />
				<text
					x={610}
					y={364}
					textAnchor="middle"
					fill="#34D399"
					fontSize={12}
					fontFamily={MONO_FONT}
					opacity={0.6}
					className="pl-status pl-label hidden md:block"
				>
					dbt run ✓ 42 models
				</text>

				{/* Warehouse */}
				<g className="pl-node" data-name="snowflake">
					<rect
						x={721}
						y={ROW.mid - 28}
						width={134}
						height={56}
						rx={13}
						fill="none"
						stroke="#9146FF"
						strokeOpacity={0.12}
						strokeWidth={1.5}
					/>
					<rect
						x={724}
						y={ROW.mid - 25}
						width={128}
						height={50}
						rx={10}
						fill="rgba(17, 24, 39, 0.65)"
						stroke="#9146FF"
						strokeOpacity={0.55}
						strokeWidth={1.5}
					/>
					<g className="pl-ico" stroke="#BF94FF" strokeWidth={1.6} strokeLinecap="round">
						<line x1={738} y1={ROW.mid} x2={754} y2={ROW.mid} />
						<line x1={738} y1={ROW.mid} x2={754} y2={ROW.mid} transform={`rotate(60 746 ${ROW.mid})`} />
						<line x1={738} y1={ROW.mid} x2={754} y2={ROW.mid} transform={`rotate(120 746 ${ROW.mid})`} />
					</g>
					<text
						x={800}
						y={ROW.mid + 4.5}
						textAnchor="middle"
						fill="#D1D5DB"
						fontSize={14}
						fontFamily={MONO_FONT}
						className="pl-label hidden md:block"
					>
						Snowflake
					</text>
				</g>

				{/* Dashboard */}
				<g className="pl-node" data-name="dashboard">
					<rect
						x={885}
						y={232}
						width={124}
						height={166}
						rx={13}
						fill="none"
						stroke="#9146FF"
						strokeOpacity={0.12}
						strokeWidth={1.5}
					/>
					<rect
						x={888}
						y={235}
						width={118}
						height={160}
						rx={10}
						fill="rgba(17, 24, 39, 0.65)"
						stroke="#9146FF"
						strokeOpacity={0.55}
						strokeWidth={1.5}
					/>
					<text
						x={947}
						y={262}
						textAnchor="middle"
						fill="#D1D5DB"
						fontSize={13}
						fontFamily={MONO_FONT}
						className="pl-label hidden md:block"
					>
						dashboard
					</text>
					{BAR_HEIGHTS.map((h, i) => (
						<rect
							key={i}
							className="pl-bar"
							x={902 + i * 28}
							y={372 - h}
							width={16}
							height={h}
							rx={3}
							fill={i % 2 === 0 ? "#9146FF" : "#BF94FF"}
							fillOpacity={0.75}
						/>
					))}
					<line x1={900} y1={372.5} x2={996} y2={372.5} stroke="#374151" strokeWidth={1.5} />
				</g>

				{/* Data packets (one per edge, driven by the loop timeline) */}
				{EDGES.map((_, i) => (
					<circle
						key={i}
						className="pl-packet"
						cx={0}
						cy={0}
						r={3.5}
						fill="#BF94FF"
						opacity={0}
						style={{ filter: "drop-shadow(0 0 6px #BF94FF)" }}
					/>
				))}
			</g>
		</svg>
	);
};

const PipelineSection = () => (
	<section
		id="pipeline"
		className="w-full relative select-none section-container py-8 md:py-12 flex flex-col items-center"
	>
		<p className="section-title-sm text-center mb-6 md:mb-8">How my data flows</p>
		<div className="w-full max-w-5xl mx-auto">
			<PipelineDag />
		</div>
	</section>
);

export default PipelineSection;
