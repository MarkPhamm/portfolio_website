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
	"M220,215 C244,215 256,215 280,215", // operational APIs -> custom python
	"M450,215 C478,215 484,270 510,270", // custom python -> S3
	"M220,310 C330,310 400,300 510,300", // partner files -> S3
	"M220,405 C244,405 256,405 280,405", // partner email -> email processor
	"M450,405 C478,405 484,330 510,330", // email processor -> S3
	"M640,255 C664,255 676,255 700,255", // S3 -> Airbyte
	"M640,345 C664,345 676,345 700,345", // S3 -> COPY
	"M840,255 C864,255 876,255 900,255", // Airbyte -> Redshift
	"M840,345 C864,345 876,345 900,345", // COPY -> Redshift
	"M1110,200 C1134,200 1146,200 1170,200", // Redshift -> RTB ML
	"M1110,300 C1134,300 1146,300 1170,300", // Redshift -> Mode
	"M1110,400 C1134,400 1146,400 1170,400", // Redshift -> Hex
];

const DASHED_EDGES = [
	"M220,120 C420,96 600,150 700,240", // marketing APIs -> Airbyte (skip S3)
	"M220,510 C480,530 720,500 900,440", // RDS -> Redshift (skip S3 + Airbyte)
];

const ORCH_PATH = "M300,580 L1180,580";

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
			viewBox="0 0 1400 680"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-full h-auto pointer-events-none select-none"
			aria-hidden="true"
		>
			<defs>
				<linearGradient id="pl-orch-grad" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="#9146FF" />
					<stop offset="100%" stopColor="#BF94FF" />
				</linearGradient>
			</defs>
			<g className="pl-root" opacity={0}>
				{/* Column headings */}
				<ColumnHeading x={125} label="sources" />
				<ColumnHeading x={365} label="ingestion" />
				<ColumnHeading x={575} label="lake" />
				<ColumnHeading x={770} label="load" />
				<ColumnHeading x={1005} label="warehouse + transform" />
				<ColumnHeading x={1265} label="consumers" />

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
					x={455}
					y={104}
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
					x={560}
					y={540}
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
				<Node x={30} y={92} w={190} h={56} label="marketing APIs" sub="Google Ads · FB · MS" name="src-marketing" />
				<Node x={30} y={187} w={190} h={56} label="operational APIs" sub="leads · quotes · policies" name="src-operational" />
				<Node x={30} y={282} w={190} h={56} label="partner files" sub="drop into S3" name="src-files" />
				<Node x={30} y={377} w={190} h={56} label="partner email" sub="files as attachments" name="src-email" />
				<Node x={30} y={482} w={190} h={56} label="RDS tables" sub="Postgres / MySQL" name="src-rds" />

				{/* Ingestion */}
				<Node x={280} y={187} w={170} h={56} label="custom python" sub="DE team — extract" name="ing-python" />
				<Node x={280} y={377} w={170} h={56} label="email processor" sub="inbox → S3" name="ing-email" />

				{/* Lake */}
				<g className="pl-node" data-name="s3">
					<rect x={507} y={207} width={136} height={186} rx={15} fill="none" stroke="#34D399" strokeOpacity={0.1} strokeWidth={1.5} />
					<rect x={510} y={210} width={130} height={180} rx={12} fill="rgba(17, 24, 39, 0.65)" stroke="#34D399" strokeOpacity={0.45} strokeWidth={1.5} />
					<text x={575} y={295} textAnchor="middle" fill="#34D399" fontSize={26} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						S3
					</text>
					<text x={575} y={327} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						raw archive
					</text>
					<text x={575} y={345} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						daily partitions
					</text>
				</g>

				{/* Load */}
				<Node x={700} y={227} w={140} h={56} label="Airbyte" sub="S3 → Redshift" name="airbyte" />
				<Node x={700} y={317} w={140} h={56} label="COPY" sub="bulk file loads" name="copy" />

				{/* Warehouse + transform */}
				<g className="pl-node" data-name="warehouse">
					<rect x={897} y={137} width={216} height={336} rx={19} fill="none" stroke="#BF94FF" strokeOpacity={0.12} strokeWidth={1.5} />
					<rect x={900} y={140} width={210} height={330} rx={16} fill="rgba(145, 70, 255, 0.06)" stroke="#BF94FF" strokeOpacity={0.5} strokeWidth={1.5} />
					<text x={1005} y={177} textAnchor="middle" fill="#BF94FF" fontSize={16} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						Redshift + dbt
					</text>
					<line x1={925} y1={196} x2={1085} y2={196} stroke="#9146FF" strokeOpacity={0.3} strokeWidth={1} />
					<text x={1005} y={228} textAnchor="middle" fill="#D1D5DB" fontSize={13.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						Redshift
					</text>
					<text x={1005} y={246} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						raw schemas + curated marts
					</text>
					<line x1={925} y1={268} x2={1085} y2={268} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
					<text x={1005} y={298} textAnchor="middle" fill="#D1D5DB" fontSize={13.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						dbt models
					</text>
					<text x={1005} y={316} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						stg → int → marts
					</text>
					<line x1={925} y1={338} x2={1085} y2={338} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
					<text x={1005} y={368} textAnchor="middle" fill="#D1D5DB" fontSize={13.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						dbt CI/CD
					</text>
					<text x={1005} y={386} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						PR checks · deploy
					</text>
					<text x={1005} y={432} textAnchor="middle" fill="#34D399" fontSize={12.5} fontFamily={MONO_FONT} opacity={0.6} className={`pl-status ${LABEL_HIDDEN_MOBILE}`}>
						dbt run ✓
					</text>
				</g>

				{/* Consumers */}
				<Node x={1170} y={172} w={200} h={56} label="RTB ML model" sub="real-time bidding" name="con-rtb" stroke="#BF94FF" />
				<Node x={1170} y={272} w={200} h={56} label="Mode" sub="BI dashboards" name="con-mode" stroke="#BF94FF" />
				<Node x={1170} y={372} w={200} h={56} label="Hex" sub="notebooks · ad-hoc" name="con-hex" stroke="#BF94FF" />

				{/* Orchestration bar */}
				<path d={ORCH_PATH} className="pl-orch-line" stroke="url(#pl-orch-grad)" strokeWidth={4} strokeLinecap="round" fill="none" />
				<polygon points="1180,570 1206,580 1180,590" fill="#BF94FF" className="pl-label" />
				<text x={740} y={556} textAnchor="middle" fill="#BF94FF" fontSize={15} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
					Airflow on MWAA
				</text>
				<text x={740} y={612} textAnchor="middle" fill="#6B7280" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
					schedules ingestion · dbt runs · data-quality checks · CI/CD
				</text>
				<text x={700} y={652} textAnchor="middle" fill="#4B5563" fontSize={11} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
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
		<div className="w-full max-w-6xl mx-auto">
			<PipelineDag />
		</div>
	</section>
);

export default PipelineSection;
