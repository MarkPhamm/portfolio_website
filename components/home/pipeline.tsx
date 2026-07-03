import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { MotionPathPlugin } from "gsap/dist/MotionPathPlugin";
import { isSmallScreen } from "pages";
import { NO_MOTION_PREFERENCE_QUERY } from "../../utils/motion";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const LABEL_HIDDEN_MOBILE = "pl-label hidden md:block";

interface NodeProps {
	x: number;
	y: number;
	w: number;
	h: number;
	label: string;
	sub?: string;
	name: string;
	stroke?: string;
}

const Node = ({ x, y, w, h, label, sub, name, stroke = "#9146FF" }: NodeProps) => (
	<g className="pl-node" data-name={name}>
		<rect
			x={x - 3}
			y={y - 3}
			width={w + 6}
			height={h + 6}
			rx={13}
			fill="none"
			stroke={stroke}
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
			stroke={stroke}
			strokeOpacity={0.55}
			strokeWidth={1.5}
		/>
		<text
			x={x + w / 2}
			y={sub ? y + h / 2 - 3 : y + h / 2 + 4.5}
			textAnchor="middle"
			fill="#D1D5DB"
			fontSize={14}
			fontFamily={MONO_FONT}
			className={LABEL_HIDDEN_MOBILE}
		>
			{label}
		</text>
		{sub && (
			<text
				x={x + w / 2}
				y={y + h / 2 + 15}
				textAnchor="middle"
				fill="#6B7280"
				fontSize={11}
				fontFamily={MONO_FONT}
				className={LABEL_HIDDEN_MOBILE}
			>
				{sub}
			</text>
		)}
	</g>
);

const ColumnHeading = ({ x, label }: { x: number; label: string }) => (
	<text
		x={x}
		y={56}
		textAnchor="middle"
		fill="#6B7280"
		fontSize={12}
		letterSpacing={2.5}
		fontFamily={MONO_FONT}
		className={LABEL_HIDDEN_MOBILE}
	>
		{label.toUpperCase()}
	</text>
);

// Edge paths in flow order — packet i rides edge i.
// 0-11 solid (primary flow), 12-13 dashed (direct paths skipping S3),
// 14 is the Airflow orchestration bar.
const SOLID_EDGES = [
	"M230,240 C256,240 269,240 295,240", // operational APIs -> custom python
	"M475,240 C505,240 509,300 535,300", // custom python -> S3
	"M230,350 C350,350 420,340 535,340", // partner files -> S3
	"M230,460 C256,460 269,460 295,460", // partner email -> email processor
	"M475,460 C505,460 509,380 535,380", // email processor -> S3
	"M675,290 C699,290 711,290 735,290", // S3 -> Airbyte
	"M675,390 C699,390 711,390 735,390", // S3 -> COPY
	"M885,290 C909,290 921,290 945,290", // Airbyte -> Redshift
	"M885,390 C909,390 921,390 945,390", // COPY -> Redshift
	"M1165,225 C1189,225 1201,225 1225,225", // Redshift -> RTB ML
	"M1165,340 C1189,340 1201,340 1225,340", // Redshift -> Mode
	"M1165,455 C1189,455 1201,455 1225,455", // Redshift -> Hex
];

const DASHED_EDGES = [
	"M230,130 C440,104 630,180 735,275", // marketing APIs -> Airbyte (skip S3)
	"M230,590 C520,615 760,580 945,500", // RDS -> Redshift (skip S3 + Airbyte)
];

const ORCH_PATH = "M320,690 L1230,690";

const PipelineDag = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const root = svg.querySelector<SVGGElement>(".pl-root");
		if (!root) return;

		const motionOk = window.matchMedia(NO_MOTION_PREFERENCE_QUERY).matches;
		if (!motionOk) {
			// Reduced motion: show the fully-drawn static diagram, no packets.
			gsap.set(root, { opacity: 1 });
			return;
		}

		const small = isSmallScreen();
		const solidEdges = Array.from(svg.querySelectorAll<SVGPathElement>(".pl-edge"));
		const dashedEdges = Array.from(svg.querySelectorAll<SVGPathElement>(".pl-dashed"));
		const orchLine = svg.querySelector<SVGPathElement>(".pl-orch-line");
		const packets = Array.from(svg.querySelectorAll<SVGCircleElement>(".pl-packet"));
		const nodes = Array.from(svg.querySelectorAll<SVGGElement>(".pl-node"));
		const labels = svg.querySelectorAll(".pl-label");
		const status = svg.querySelector(".pl-status");
		// Packet path lookup: 0-11 solid, 12-13 dashed, 14 orchestration.
		const packetPaths: (SVGPathElement | null)[] = [...solidEdges, ...dashedEdges, orchLine];

		const nodeByName = (name: string): SVGGElement | undefined =>
			nodes.find((n) => n.dataset.name === name);

		// Prepare the draw-on state before revealing the root (no flash).
		const drawTargets = orchLine ? [...solidEdges, orchLine] : solidEdges;
		drawTargets.forEach((edge) => {
			const len = edge.getTotalLength();
			gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len });
		});
		gsap.set(root, { opacity: 1 });

		// --- Entrance: edges draw themselves, nodes pop in along the flow.
		// Plays when the section scrolls into view (it sits below the hero). ---
		const entrance = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
		entrance.to(
			drawTargets,
			{ strokeDashoffset: 0, duration: 0.7, stagger: 0.06, ease: "power1.inOut" },
			0.1
		);
		entrance.fromTo(
			nodes,
			{ scale: 0.6, opacity: 0, transformOrigin: "50% 50%" },
			{ scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.4)", stagger: 0.05 },
			0.15
		);
		if (dashedEdges.length) {
			entrance.fromTo(dashedEdges, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.9);
		}
		entrance.fromTo(labels, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.8);
		if (status) entrance.set(status, { opacity: 0.6 });

		// --- Perpetual loop: one full "pipeline run" per cycle ---
		const loop = gsap.timeline({ repeat: -1, paused: true });

		const runPacket = (pathIdx: number, at: number, duration: number) => {
			const packet = packets[pathIdx];
			const path = packetPaths[pathIdx];
			if (!packet || !path) return;
			loop.set(packet, { opacity: 1 }, at);
			loop.to(
				packet,
				{
					motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
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
					scale: 1.04,
					duration: 0.18,
					yoyo: true,
					repeat: 1,
					transformOrigin: "50% 50%",
					ease: "power1.inOut",
				},
				at
			);
		};

		if (small) {
			// Single lane on phones: one packet walks the primary path.
			runPacket(0, 0, 0.9);
			runPacket(1, 1.0, 0.9);
			runPacket(5, 2.0, 0.8);
			runPacket(7, 2.9, 0.8);
			runPacket(9, 3.8, 0.9);
			loop.to({}, { duration: 1.2 }, 5.2);
		} else {
			// Extract: sources feed ingestion + the lake (plus direct paths).
			runPacket(0, 0, 0.9);
			runPacket(2, 0, 1.4);
			runPacket(3, 0.15, 0.9);
			runPacket(12, 0.2, 2.0);
			pulse("ing-python", 0.95);
			pulse("ing-email", 1.1);
			runPacket(1, 1.15, 0.9);
			runPacket(4, 1.3, 0.9);
			pulse("s3", 2.25);

			// Load: S3 fans out to Airbyte + COPY, direct RDS path joins.
			runPacket(5, 2.45, 0.8);
			runPacket(6, 2.6, 0.8);
			pulse("airbyte", 3.3);
			pulse("copy", 3.45);
			runPacket(7, 3.55, 0.8);
			runPacket(8, 3.7, 0.8);
			runPacket(13, 1.5, 2.4);

			// Transform: dbt runs inside Redshift.
			pulse("warehouse", 4.5);
			if (status) {
				loop.to(status, { opacity: 1, duration: 0.15 }, 4.6);
				loop.to(status, { opacity: 0.6, duration: 0.4 }, 5.05);
			}

			// Serve: marts feed the consumers.
			runPacket(9, 5.2, 0.9);
			runPacket(10, 5.35, 0.9);
			runPacket(11, 5.5, 0.9);
			pulse("con-rtb", 6.15);
			pulse("con-mode", 6.3);
			pulse("con-hex", 6.45);

			// Orchestration heartbeat across the whole cycle.
			runPacket(14, 0, 6.5);

			// Settle before the next run.
			loop.to({}, { duration: 1.4 }, 7.0);
		}

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

	const packetCount = SOLID_EDGES.length + DASHED_EDGES.length + 1;

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 1440 800"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-full h-auto pointer-events-none select-none"
			aria-hidden="true"
		>
			<defs>
				{/* userSpaceOnUse — bounding-box gradients are undefined (invisible)
				    on a perfectly horizontal line, whose bbox height is 0. */}
				<linearGradient id="pl-orch-grad" gradientUnits="userSpaceOnUse" x1={320} y1={690} x2={1230} y2={690}>
					<stop offset="0%" stopColor="#9146FF" />
					<stop offset="100%" stopColor="#BF94FF" />
				</linearGradient>
			</defs>
			<g className="pl-root" opacity={0}>
				{/* Column headings */}
				<ColumnHeading x={130} label="sources" />
				<ColumnHeading x={385} label="ingestion" />
				<ColumnHeading x={605} label="lake" />
				<ColumnHeading x={810} label="load" />
				<ColumnHeading x={1055} label="warehouse + transform" />
				<ColumnHeading x={1325} label="consumers" />

				{/* Solid edges (primary flow) */}
				{SOLID_EDGES.map((d, i) => (
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

				{/* Dashed edges (direct paths skipping S3) */}
				{DASHED_EDGES.map((d, i) => (
					<path
						key={i}
						d={d}
						className="pl-dashed"
						stroke="#9146FF"
						strokeOpacity={0.28}
						strokeWidth={1.5}
						strokeDasharray="5 7"
						fill="none"
					/>
				))}
				<text
					x={470}
					y={112}
					textAnchor="middle"
					fill="#6B7280"
					fontSize={11}
					fontStyle="italic"
					fontFamily={MONO_FONT}
					className={LABEL_HIDDEN_MOBILE}
				>
					direct → Airbyte (skip S3)
				</text>
				<text
					x={585}
					y={622}
					textAnchor="middle"
					fill="#6B7280"
					fontSize={11}
					fontStyle="italic"
					fontFamily={MONO_FONT}
					className={LABEL_HIDDEN_MOBILE}
				>
					direct → Redshift (skip S3 + Airbyte)
				</text>

				{/* Sources */}
				<Node x={30} y={102} w={200} h={56} label="marketing APIs" sub="Google Ads · FB · MS" name="src-marketing" />
				<Node x={30} y={212} w={200} h={56} label="operational APIs" sub="leads · quotes · policies" name="src-operational" />
				<Node x={30} y={322} w={200} h={56} label="partner files" sub="drop into S3" name="src-files" />
				<Node x={30} y={432} w={200} h={56} label="partner email" sub="files as attachments" name="src-email" />
				<Node x={30} y={562} w={200} h={56} label="RDS tables" sub="Postgres / MySQL" name="src-rds" />

				{/* Ingestion */}
				<Node x={295} y={212} w={180} h={56} label="custom python" sub="DE team — extract" name="ing-python" />
				<Node x={295} y={432} w={180} h={56} label="email processor" sub="inbox → S3" name="ing-email" />

				{/* Lake */}
				<g className="pl-node" data-name="s3">
					<rect x={532} y={227} width={146} height={226} rx={15} fill="none" stroke="#34D399" strokeOpacity={0.1} strokeWidth={1.5} />
					<rect x={535} y={230} width={140} height={220} rx={12} fill="rgba(17, 24, 39, 0.65)" stroke="#34D399" strokeOpacity={0.45} strokeWidth={1.5} />
					<text x={605} y={330} textAnchor="middle" fill="#34D399" fontSize={28} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						S3
					</text>
					<text x={605} y={368} textAnchor="middle" fill="#6B7280" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						raw archive
					</text>
					<text x={605} y={388} textAnchor="middle" fill="#6B7280" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						daily partitions
					</text>
				</g>

				{/* Load */}
				<Node x={735} y={262} w={150} h={56} label="Airbyte" sub="S3 → Redshift" name="airbyte" />
				<Node x={735} y={362} w={150} h={56} label="COPY" sub="bulk file loads" name="copy" />

				{/* Warehouse + transform */}
				<g className="pl-node" data-name="warehouse">
					<rect x={942} y={147} width={226} height={386} rx={19} fill="none" stroke="#BF94FF" strokeOpacity={0.12} strokeWidth={1.5} />
					<rect x={945} y={150} width={220} height={380} rx={16} fill="rgba(145, 70, 255, 0.06)" stroke="#BF94FF" strokeOpacity={0.5} strokeWidth={1.5} />
					<text x={1055} y={192} textAnchor="middle" fill="#BF94FF" fontSize={17} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						Redshift + dbt
					</text>
					<line x1={972} y1={212} x2={1138} y2={212} stroke="#9146FF" strokeOpacity={0.3} strokeWidth={1} />
					<text x={1055} y={248} textAnchor="middle" fill="#D1D5DB" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						Redshift
					</text>
					<text x={1055} y={266} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						raw schemas + curated marts
					</text>
					<line x1={972} y1={292} x2={1138} y2={292} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
					<text x={1055} y={328} textAnchor="middle" fill="#D1D5DB" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						dbt models
					</text>
					<text x={1055} y={346} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						stg → int → marts
					</text>
					<line x1={972} y1={372} x2={1138} y2={372} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
					<text x={1055} y={408} textAnchor="middle" fill="#D1D5DB" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						dbt CI/CD
					</text>
					<text x={1055} y={426} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						PR checks · deploy
					</text>
					<text x={1055} y={482} textAnchor="middle" fill="#34D399" fontSize={13} fontFamily={MONO_FONT} opacity={0.6} className={`pl-status ${LABEL_HIDDEN_MOBILE}`}>
						dbt run ✓
					</text>
				</g>

				{/* Consumers */}
				<Node x={1225} y={197} w={200} h={56} label="RTB ML model" sub="real-time bidding" name="con-rtb" stroke="#BF94FF" />
				<Node x={1225} y={312} w={200} h={56} label="Mode" sub="BI dashboards" name="con-mode" stroke="#BF94FF" />
				<Node x={1225} y={427} w={200} h={56} label="Hex" sub="notebooks · ad-hoc" name="con-hex" stroke="#BF94FF" />

				{/* Orchestration bar */}
				<path d={ORCH_PATH} className="pl-orch-line" stroke="url(#pl-orch-grad)" strokeWidth={4} strokeLinecap="round" fill="none" />
				<polygon points="1230,678 1258,690 1230,702" fill="#BF94FF" className="pl-label" />
				<text x={775} y={664} textAnchor="middle" fill="#BF94FF" fontSize={16} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
					Airflow on MWAA
				</text>
				<text x={775} y={724} textAnchor="middle" fill="#6B7280" fontSize={12.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
					schedules ingestion · dbt runs · data-quality checks · CI/CD
				</text>
				<text x={720} y={768} textAnchor="middle" fill="#4B5563" fontSize={11} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
					solid = primary flow · dashed = direct paths skipping S3
				</text>

				{/* Data packets (one per path, driven by the loop timeline) */}
				{Array.from({ length: packetCount }, (_, i) => (
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
		<div className="w-full max-w-7xl mx-auto">
			<PipelineDag />
		</div>
	</section>
);

export default PipelineSection;
