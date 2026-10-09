import React, { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { MotionPathPlugin } from "gsap/dist/MotionPathPlugin";
import { isSmallScreen } from "pages";
import { NO_MOTION_PREFERENCE_QUERY } from "../../utils/motion";
import { getTechUrl } from "../../constants";
import PipelineToggle, { PipelineVariant } from "./pipeline-toggle";
import SectionHeader from "../common/section-header";
import { trackEvent } from "../../utils/clarity";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

const MONO_FONT = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const LABEL_HIDDEN_MOBILE = "pl-label hidden md:block";

// Wraps a piece of the (otherwise pointer-events-none) diagram in an SVG anchor
// so it links to the tool's official site. Concept-only nodes pass a name with
// no entry in TECH_LINKS and render inert. pointer-events:auto re-enables the
// click that the root <svg> disables; the whole diagram stays scroll-through.
const TechLink = ({
	tech,
	children,
}: {
	tech: string;
	children: React.ReactNode;
}) => {
	const url = getTechUrl(tech);
	if (!url) return <>{children}</>;
	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${tech} — opens in new tab`}
			className="pointer-events-auto cursor-pointer transition-opacity duration-[10ms] hover:opacity-70"
		>
			{children}
		</a>
	);
};

interface NodeProps {
	x: number;
	y: number;
	w: number;
	h: number;
	label: string;
	sub?: string;
	name: string;
	stroke?: string;
	/** Tool logo path (from /public). Icons stay visible on mobile, where
	    the text labels are hidden — they carry the readability there. */
	icon?: string;
	/** CSS filter for the icon (e.g. invert(1) for black-on-transparent art). */
	iconFilter?: string;
	/** Icon edge length; bump for wordmark-style art that reads too small at 24. */
	iconSize?: number;
	/** Tech name for the outbound link; omit for concept-only nodes. */
	tech?: string;
}

const Node = ({ x, y, w, h, label, sub, name, stroke = "#9146FF", icon, iconFilter, iconSize = 24, tech }: NodeProps) => {
	// With a left-aligned icon, the text block re-centers in the space to its right.
	const textX = x + w / 2 + (icon ? iconSize / 2 + 2 : 0);
	const group = (
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
				fill="rgba(12, 11, 16, 0.82)"
				stroke={stroke}
				strokeOpacity={0.55}
				strokeWidth={1.5}
			/>
			{icon && (
				<image
					href={icon}
					x={x + 12}
					y={y + h / 2 - iconSize / 2}
					width={iconSize}
					height={iconSize}
					style={iconFilter ? { filter: iconFilter } : undefined}
				/>
			)}
			<text
				x={textX}
				y={sub ? y + h / 2 - 3 : y + h / 2 + 4.5}
				textAnchor="middle"
				fill="#DAD8E0"
				fontSize={14}
				fontFamily={MONO_FONT}
				className={LABEL_HIDDEN_MOBILE}
			>
				{label}
			</text>
			{sub && (
				<text
					x={textX}
					y={y + h / 2 + 15}
					textAnchor="middle"
					fill="#807E8A"
					fontSize={11}
					fontFamily={MONO_FONT}
					className={LABEL_HIDDEN_MOBILE}
				>
					{sub}
				</text>
			)}
		</g>
	);
	return tech ? <TechLink tech={tech}>{group}</TechLink> : group;
};

const ColumnHeading = ({ x, label }: { x: number; label: string }) => (
	<text
		x={x}
		y={56}
		textAnchor="middle"
		fill="#807E8A"
		fontSize={12}
		letterSpacing={2.5}
		fontFamily={MONO_FONT}
		className={LABEL_HIDDEN_MOBILE}
	>
		{label.toUpperCase()}
	</text>
);

// The six column headings. Only the ingestion label differs between variants,
// but all six live inside each variant group so the morph has one simple rule:
// everything except S3, the warehouse frame, and the Airflow bar crossfades.
const Headings = ({ ingestion }: { ingestion: string }) => (
	<>
		<ColumnHeading x={130} label="sources" />
		<ColumnHeading x={385} label={ingestion} />
		<ColumnHeading x={605} label="lake" />
		<ColumnHeading x={810} label="load" />
		<ColumnHeading x={1055} label="warehouse + transform" />
		<ColumnHeading x={1325} label="consumers" />
	</>
);

// Edge paths in flow order — packet i rides edge i within its variant.
// Per variant: [0..s) solid (primary flow), [s..s+d) dashed (direct paths),
// [s+d..s+d+r) reverse ETL, and the last packet index rides the shared
// Airflow orchestration bar.
interface EdgeSet {
	solid: string[];
	dashed: string[];
	reverse: string[];
}

const EDGES: Record<PipelineVariant, EdgeSet> = {
	ins: {
		solid: [
			"M230,222 C256,222 269,240 295,240", // operational APIs -> apis processor
			"M475,240 C505,240 509,300 535,300", // apis processor -> S3
			"M230,314 C350,314 420,332 535,340", // partner files -> S3
			"M230,406 C260,406 265,460 295,460", // partner email -> email processor
			"M475,460 C505,460 509,380 535,380", // email processor -> S3
			"M675,290 C699,290 711,290 735,290", // S3 -> Airbyte
			"M675,390 C699,390 711,390 735,390", // S3 -> COPY
			"M885,290 C909,290 921,290 945,290", // Airbyte -> Redshift
			"M885,390 C909,390 921,390 945,390", // COPY -> Redshift
			"M1165,225 C1189,225 1201,225 1225,225", // Redshift -> RTB ML
			"M1165,340 C1189,340 1201,340 1225,340", // Redshift -> Mode
			"M1165,455 C1189,455 1201,455 1225,455", // Redshift -> Hex
		],
		dashed: [
			"M230,130 C440,104 630,180 735,275", // marketing APIs -> Airbyte (skip S3)
			"M230,590 C520,615 760,580 945,500", // RDS -> Redshift (skip S3 + Airbyte)
			"M230,498 C520,530 760,520 945,470", // front-end events (Snowplow) -> Redshift
		],
		// Reverse ETL — curated marts flow back out to the ad platforms via
		// Hightouch, right→left across the top lane. Endpoints land on the
		// Hightouch node's right (840,-62) and left (570,-62) edges.
		reverse: [
			"M950,147 C885,110 845,10 840,-62", // Redshift -> Hightouch
			"M570,-62 C395,-62 250,-40 180,102", // Hightouch -> marketing APIs
		],
	},
	il: {
		solid: [
			"M230,130 C265,130 262,285 295,285", // client SaaS apps -> Fivetran
			"M230,245 C265,245 262,322 295,322", // client databases -> Fivetran
			"M230,360 C256,360 269,358 295,358", // client APIs -> Fivetran
			"M230,475 C265,475 262,395 295,395", // event streams -> Fivetran
			"M230,590 C360,600 430,450 535,420", // flat files -> S3 (SFTP drops)
			"M475,340 C499,340 511,340 535,340", // Fivetran -> S3
			"M675,340 C699,340 711,340 735,340", // S3 -> COPY INTO
			"M885,340 C909,340 921,340 945,340", // COPY INTO -> Snowflake
			"M1165,283 C1189,283 1201,283 1225,283", // Snowflake -> Omni
			"M1165,397 C1189,397 1201,397 1225,397", // Snowflake -> client teams
		],
		dashed: [
			"M475,255 C640,180 800,180 945,230", // Fivetran -> Snowflake (skip S3)
		],
		reverse: [],
	},
};

const ORCH_PATH = "M320,690 L1230,690";

const packetCount = (v: PipelineVariant) =>
	EDGES[v].solid.length + EDGES[v].dashed.length + EDGES[v].reverse.length + 1;

// --- Loop choreography, one full "pipeline run" per cycle, as data ---
interface PacketStep {
	path: number;
	at: number;
	dur: number;
}
interface PulseStep {
	name: string;
	at: number;
}
interface Choreo {
	desktop: PacketStep[];
	mobile: PacketStep[];
	pulses: PulseStep[];
	statusBlink: number;
	settle: { at: number; dur: number };
	mobileSettle: { at: number; dur: number };
}

const CHOREO: Record<PipelineVariant, Choreo> = {
	ins: {
		// Extract -> Load -> Transform -> Serve -> Activate (reverse ETL),
		// with the direct paths overlapping and the orch heartbeat spanning all.
		desktop: [
			{ path: 0, at: 0, dur: 0.9 },
			{ path: 2, at: 0, dur: 1.4 },
			{ path: 3, at: 0.15, dur: 0.9 },
			{ path: 12, at: 0.2, dur: 2.0 },
			{ path: 1, at: 1.15, dur: 0.9 },
			{ path: 4, at: 1.3, dur: 0.9 },
			{ path: 13, at: 1.5, dur: 2.4 },
			{ path: 14, at: 1.7, dur: 2.3 },
			{ path: 5, at: 2.45, dur: 0.8 },
			{ path: 6, at: 2.6, dur: 0.8 },
			{ path: 7, at: 3.55, dur: 0.8 },
			{ path: 8, at: 3.7, dur: 0.8 },
			{ path: 9, at: 5.2, dur: 0.9 },
			{ path: 10, at: 5.35, dur: 0.9 },
			{ path: 11, at: 5.5, dur: 0.9 },
			{ path: 15, at: 6.0, dur: 1.1 },
			{ path: 16, at: 7.15, dur: 1.2 },
			{ path: 17, at: 0, dur: 8.6 },
		],
		// Single lane on phones: one packet walks the primary path,
		// then the reverse-ETL loop back out to the ad platforms.
		mobile: [
			{ path: 0, at: 0, dur: 0.9 },
			{ path: 1, at: 1.0, dur: 0.9 },
			{ path: 5, at: 2.0, dur: 0.8 },
			{ path: 7, at: 2.9, dur: 0.8 },
			{ path: 9, at: 3.8, dur: 0.9 },
			{ path: 15, at: 4.8, dur: 1.0 },
			{ path: 16, at: 5.9, dur: 1.1 },
		],
		pulses: [
			{ name: "ing-python", at: 0.95 },
			{ name: "ing-email", at: 1.1 },
			{ name: "s3", at: 2.25 },
			{ name: "airbyte", at: 3.3 },
			{ name: "copy", at: 3.45 },
			{ name: "warehouse", at: 4.5 },
			{ name: "con-rtb", at: 6.15 },
			{ name: "con-mode", at: 6.3 },
			{ name: "con-hex", at: 6.45 },
			{ name: "rev-ht", at: 7.0 },
			{ name: "src-marketing", at: 8.25 },
		],
		statusBlink: 4.6,
		settle: { at: 8.7, dur: 1.3 },
		mobileSettle: { at: 7.1, dur: 1.0 },
	},
	il: {
		// Fan-in to Fivetran -> lake -> COPY -> Snowflake + dbt -> serve.
		desktop: [
			{ path: 0, at: 0, dur: 0.9 },
			{ path: 1, at: 0.12, dur: 0.9 },
			{ path: 2, at: 0.24, dur: 0.9 },
			{ path: 3, at: 0.36, dur: 0.9 },
			{ path: 4, at: 0.3, dur: 1.5 },
			{ path: 5, at: 1.45, dur: 0.8 },
			{ path: 10, at: 1.45, dur: 1.9 },
			{ path: 6, at: 2.6, dur: 0.8 },
			{ path: 7, at: 3.5, dur: 0.8 },
			{ path: 8, at: 5.1, dur: 0.9 },
			{ path: 9, at: 5.25, dur: 0.9 },
			{ path: 11, at: 0, dur: 7.4 },
		],
		mobile: [
			{ path: 0, at: 0, dur: 0.9 },
			{ path: 5, at: 1.0, dur: 0.8 },
			{ path: 6, at: 1.9, dur: 0.8 },
			{ path: 7, at: 2.8, dur: 0.8 },
			{ path: 8, at: 3.7, dur: 0.9 },
		],
		pulses: [
			{ name: "fivetran", at: 1.15 },
			{ name: "s3", at: 2.35 },
			{ name: "il-copy", at: 3.35 },
			{ name: "warehouse", at: 4.3 },
			{ name: "con-omni", at: 6.0 },
			{ name: "con-clients", at: 6.15 },
		],
		statusBlink: 4.45,
		settle: { at: 7.5, dur: 1.3 },
		mobileSettle: { at: 4.8, dur: 1.0 },
	},
};

// Collects a variant's animatable elements. Nodes include the shared group
// (S3, warehouse frame) so pulses and morphs can reach the persistent pieces.
const getVariantEls = (svg: SVGSVGElement, v: PipelineVariant) => {
	const group = svg.querySelector<SVGGElement>(`.pl-v-${v}`);
	const scoped = <T extends Element>(sel: string): T[] =>
		group ? Array.from(group.querySelectorAll<T>(sel)) : [];
	const solid = scoped<SVGPathElement>(".pl-edge");
	const dashed = scoped<SVGPathElement>(".pl-dashed");
	const reverse = scoped<SVGPathElement>(".pl-reverse");
	const packets = scoped<SVGCircleElement>(".pl-packet");
	const orchLine = svg.querySelector<SVGPathElement>(".pl-orch-line");
	const nodes = Array.from(
		svg.querySelectorAll<SVGGElement>(`.pl-v-${v} .pl-node, .pl-shared .pl-node`)
	);
	const status = group?.querySelector(".pl-status") ?? null;
	const packetPaths: (SVGPathElement | null)[] = [...solid, ...dashed, ...reverse, orchLine];
	return { group, solid, dashed, reverse, packets, orchLine, nodes, status, packetPaths };
};

// Builds the perpetual packet loop for one variant from its choreography table.
const buildLoop = (svg: SVGSVGElement, v: PipelineVariant, small: boolean) => {
	const els = getVariantEls(svg, v);
	const loop = gsap.timeline({ repeat: -1, paused: true });

	const runPacket = ({ path: pathIdx, at, dur }: PacketStep) => {
		const packet = els.packets[pathIdx];
		const path = els.packetPaths[pathIdx];
		if (!packet || !path) return;
		loop.set(packet, { opacity: 1 }, at);
		loop.to(
			packet,
			{
				motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
				duration: dur,
				ease: "none",
			},
			at
		);
		loop.to(packet, { opacity: 0, duration: 0.18 }, at + dur - 0.18);
	};

	const pulse = ({ name, at }: PulseStep) => {
		const node = els.nodes.find((n) => n.dataset.name === name);
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

	const c = CHOREO[v];
	(small ? c.mobile : c.desktop).forEach(runPacket);
	if (!small) {
		c.pulses.forEach(pulse);
		if (els.status) {
			loop.to(els.status, { opacity: 1, duration: 0.15 }, c.statusBlink);
			loop.to(els.status, { opacity: 0.6, duration: 0.4 }, c.statusBlink + 0.45);
		}
	}
	const settle = small ? c.mobileSettle : c.settle;
	loop.to({}, { duration: settle.dur }, settle.at);
	return loop;
};

const VariantEdges = ({ v }: { v: PipelineVariant }) => (
	<>
		{EDGES[v].solid.map((d, i) => (
			<path key={i} d={d} className="pl-edge" stroke="#9146FF" strokeOpacity={0.3} strokeWidth={1.5} fill="none" />
		))}
		{EDGES[v].dashed.map((d, i) => (
			<path key={i} d={d} className="pl-dashed" stroke="#9146FF" strokeOpacity={0.28} strokeWidth={1.5} strokeDasharray="5 7" fill="none" />
		))}
		{/* Reverse ETL edges — lighter purple + fine dots set them apart. */}
		{EDGES[v].reverse.map((d, i) => (
			<path key={i} d={d} className="pl-reverse" stroke="#BF94FF" strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="2 6" fill="none" />
		))}
	</>
);

const Packets = ({ v }: { v: PipelineVariant }) => (
	<>
		{Array.from({ length: packetCount(v) }, (_, i) => (
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
	</>
);

interface DagProps {
	variant: PipelineVariant;
	/** The initial Insurify loop finished one full pass — parent may auto-switch. */
	onAutoMorph: () => void;
	/** Entrance done (or reduced motion) — the toggle can be enabled. */
	onReady: () => void;
	onMorphingChange: (morphing: boolean) => void;
}

interface DagCtrl {
	loop: gsap.core.Timeline | null;
	morph: gsap.core.Timeline | null;
	started: boolean;
	inView: boolean;
	motionOk: boolean;
	small: boolean;
}

const PipelineDag = ({ variant, onAutoMorph, onReady, onMorphingChange }: DagProps) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const ctrlRef = useRef<DagCtrl>({
		loop: null,
		morph: null,
		started: false,
		inView: false,
		motionOk: false,
		small: false,
	});
	const prevVariantRef = useRef<PipelineVariant>("ins");
	const cbRef = useRef({ onAutoMorph, onReady, onMorphingChange });
	cbRef.current = { onAutoMorph, onReady, onMorphingChange };

	// Mount: entrance draw + the Insurify loop. The hidden IL group is untouched
	// here — it only ever participates via the morph below.
	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const root = svg.querySelector<SVGGElement>(".pl-root");
		if (!root) return;

		const ctrl = ctrlRef.current;
		ctrl.motionOk = window.matchMedia(NO_MOTION_PREFERENCE_QUERY).matches;
		if (!ctrl.motionOk) {
			// Reduced motion: show the fully-drawn static diagram, no packets.
			// The toggle still works — the variant effect swaps groups instantly.
			gsap.set(root, { opacity: 1 });
			cbRef.current.onReady();
			return;
		}

		ctrl.small = isSmallScreen();
		const ins = getVariantEls(svg, "ins");
		const labels = svg.querySelectorAll(".pl-shared .pl-label, .pl-v-ins .pl-label");

		// Prepare the draw-on state before revealing the root (no flash).
		const drawTargets = ins.orchLine ? [...ins.solid, ins.orchLine] : ins.solid;
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
			ins.nodes,
			{ scale: 0.6, opacity: 0, transformOrigin: "50% 50%" },
			{ scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.4)", stagger: 0.05 },
			0.15
		);
		if (ins.dashed.length) {
			entrance.fromTo(ins.dashed, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.9);
		}
		if (ins.reverse.length) {
			entrance.fromTo(ins.reverse, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.95);
		}
		entrance.fromTo(labels, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.8);
		if (ins.status) entrance.set(ins.status, { opacity: 0.6 });

		ctrl.loop = buildLoop(svg, "ins", ctrl.small);
		// Auto-morph once, 5s into the Insurify loop. Riding the timeline (not
		// a wall-clock timer) means it inherently respects the off-screen pause
		// gate. The parent ignores it after any manual pill click, and the
		// morph rebuilds the loop without this call, so it only ever fires once.
		ctrl.loop.call(() => cbRef.current.onAutoMorph(), [], 5);

		entrance.eventCallback("onComplete", () => {
			ctrl.started = true;
			cbRef.current.onReady();
			if (ctrl.inView) ctrl.loop?.play();
		});
		const entranceTrigger = ScrollTrigger.create({
			trigger: svg,
			start: "top 85%",
			once: true,
			onEnter: () => entrance.play(),
		});
		// Don't burn CPU while the section is off-screen. Callbacks read the
		// ctrl ref so pause/play keeps working after a morph rebuilds the loop.
		const loopTrigger = ScrollTrigger.create({
			trigger: svg,
			start: "top bottom",
			end: "bottom top",
			onEnter: () => {
				ctrl.inView = true;
				if (ctrl.started) ctrl.loop?.play();
			},
			onEnterBack: () => {
				ctrl.inView = true;
				if (ctrl.started) ctrl.loop?.play();
			},
			onLeave: () => {
				ctrl.inView = false;
				ctrl.loop?.pause();
			},
			onLeaveBack: () => {
				ctrl.inView = false;
				ctrl.loop?.pause();
			},
		});

		return () => {
			entranceTrigger.kill();
			loopTrigger.kill();
			entrance.kill();
			ctrl.loop?.kill();
			ctrl.morph?.kill();
			ctrl.loop = null;
			ctrl.morph = null;
		};
	}, []);

	// Variant morph: crossfade the outgoing group into the incoming one while
	// S3, the warehouse frame, and the Airflow bar hold still. Both the toggle
	// and the one-time auto-morph land here via the variant prop.
	useEffect(() => {
		const prev = prevVariantRef.current;
		if (prev === variant) return;
		prevVariantRef.current = variant;

		const svg = svgRef.current;
		if (!svg) return;
		const ctrl = ctrlRef.current;
		const oldGroup = svg.querySelector<SVGGElement>(`.pl-v-${prev}`);
		const newGroup = svg.querySelector<SVGGElement>(`.pl-v-${variant}`);
		if (!oldGroup || !newGroup) return;

		if (!ctrl.motionOk) {
			// autoAlpha (visibility) keeps the hidden variant's anchors out of
			// hit-testing and tab order, not just invisible.
			gsap.set(oldGroup, { autoAlpha: 0 });
			gsap.set(newGroup, { autoAlpha: 1 });
			return;
		}

		ctrl.morph?.kill();
		ctrl.loop?.kill();
		ctrl.loop = null;
		cbRef.current.onMorphingChange(true);

		const els = getVariantEls(svg, variant);
		// Old packets are mid-path; drop them before the group fades.
		gsap.set(oldGroup.querySelectorAll(".pl-packet"), { opacity: 0 });

		// Prep the incoming group while it's still hidden: edges wound back to
		// their draw-on state, nodes slightly shrunk, loose labels (headings,
		// annotations, legend — not inside a node) faded.
		const ownNodes = Array.from(newGroup.querySelectorAll<SVGGElement>(".pl-node"));
		const looseLabels = Array.from(newGroup.querySelectorAll<SVGElement>(".pl-label")).filter(
			(el) => !el.closest(".pl-node")
		);
		els.solid.forEach((edge) => {
			const len = edge.getTotalLength();
			gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len });
		});
		if (els.dashed.length) gsap.set(els.dashed, { opacity: 0 });
		if (els.reverse.length) gsap.set(els.reverse, { opacity: 0 });
		gsap.set(ownNodes, { scale: 0.88, opacity: 0, transformOrigin: "50% 50%" });
		if (looseLabels.length) gsap.set(looseLabels, { opacity: 0 });

		const morph = gsap.timeline({
			onComplete: () => {
				ctrl.morph = null;
				ctrl.loop = buildLoop(svg, variant, ctrl.small);
				if (ctrl.inView) ctrl.loop.play();
				cbRef.current.onMorphingChange(false);
			},
		});
		// Overlapping phases — the diagram is never empty mid-morph.
		morph.to(oldGroup, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0);
		morph.set(newGroup, { autoAlpha: 1 }, 0.25);
		morph.to(
			ownNodes,
			{ scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.4)", stagger: 0.04 },
			0.3
		);
		morph.to(
			els.solid,
			{ strokeDashoffset: 0, duration: 0.55, stagger: 0.05, ease: "power1.inOut" },
			0.4
		);
		if (looseLabels.length) morph.to(looseLabels, { opacity: 1, duration: 0.4 }, 0.55);
		if (els.dashed.length) morph.to(els.dashed, { opacity: 1, duration: 0.4 }, 0.8);
		if (els.reverse.length) morph.to(els.reverse, { opacity: 1, duration: 0.4 }, 0.85);
		ctrl.morph = morph;
	}, [variant]);

	return (
		<svg
			ref={svgRef}
			viewBox="0 -120 1440 920"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-full h-auto pointer-events-none select-none"
		>
			{/* No aria-hidden: the node links are real anchors and must stay
			    keyboard/screen-reader reachable. Each <a> carries its own label;
			    decorative packets/edges have none. */}
			<title>Data pipeline architecture diagram</title>
			<defs>
				{/* userSpaceOnUse — bounding-box gradients are undefined (invisible)
				    on a perfectly horizontal line, whose bbox height is 0. */}
				<linearGradient id="pl-orch-grad" gradientUnits="userSpaceOnUse" x1={320} y1={690} x2={1230} y2={690}>
					<stop offset="0%" stopColor="#9146FF" />
					<stop offset="100%" stopColor="#BF94FF" />
				</linearGradient>
				{/* Rounds the Hightouch brand mark into an app-icon chip — it ships on an
				    opaque gradient, so a sharp square would read as a light tile. */}
				<clipPath id="pl-ht-clip">
					<rect x={590} y={-78} width={32} height={32} rx={7} />
				</clipPath>
			</defs>
			<g className="pl-root" opacity={0}>
				{/* ============ Insurify variant ============ */}
				<g className="pl-v pl-v-ins">
					<Headings ingestion="ingestion" />
					<VariantEdges v="ins" />
					<text
						x={470}
						y={112}
						textAnchor="middle"
						fill="#807E8A"
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
						fill="#807E8A"
						fontSize={11}
						fontStyle="italic"
						fontFamily={MONO_FONT}
						className={LABEL_HIDDEN_MOBILE}
					>
						direct → Redshift (skip S3 + Airbyte)
					</text>

					{/* Sources */}
					<Node x={30} y={102} w={200} h={56} label="marketing APIs" sub="Google Ads · FB · MS" name="src-marketing" icon="/pipeline/megaphone.svg" />
					<Node x={30} y={194} w={200} h={56} label="operational APIs" sub="leads · quotes · policies" name="src-operational" icon="/pipeline/api.svg" />
					<Node x={30} y={286} w={200} h={56} label="partner files" sub="drop into S3" name="src-files" icon="/pipeline/files.svg" />
					<Node x={30} y={378} w={200} h={56} label="partner email" sub="files as attachments" name="src-email" icon="/pipeline/email.svg" />
					<Node x={30} y={470} w={200} h={56} label="front-end events" sub="Snowplow trackers" name="src-snowplow" icon="/pipeline/snowplow.png" tech="Snowplow" />
					<Node x={30} y={562} w={200} h={56} label="RDS tables" sub="Postgres / MySQL" name="src-rds" icon="/projects/tech/PostgreSQL.svg" tech="PostgreSQL" />

					{/* Reverse ETL — Hightouch activates curated marts back to the ad platforms.
					    Rendered inline (not via <Node>) so it can run a little larger than the
					    other cards to spotlight the reverse-ETL leg; sits in the top lane and the
					    arc returns down into the marketing APIs node. */}
					<TechLink tech="Hightouch">
						<g className="pl-node" data-name="rev-ht">
							<rect x={567} y={-101} width={276} height={78} rx={15} fill="none" stroke="#BF94FF" strokeOpacity={0.12} strokeWidth={1.5} />
							<rect x={570} y={-98} width={270} height={72} rx={12} fill="rgba(12, 11, 16, 0.82)" stroke="#BF94FF" strokeOpacity={0.55} strokeWidth={1.5} />
							<image href="/pipeline/hightouch.png" x={590} y={-78} width={32} height={32} clipPath="url(#pl-ht-clip)" />
							<text x={729} y={-68} textAnchor="middle" fill="#DAD8E0" fontSize={16} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								Hightouch
							</text>
							<text x={729} y={-48} textAnchor="middle" fill="#807E8A" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								reverse ETL · sync audiences
							</text>
						</g>
					</TechLink>
					<polygon points="173,90 187,90 180,105" fill="#BF94FF" fillOpacity={0.7} className="pl-label" />

					{/* Ingestion */}
					<Node x={295} y={212} w={180} h={56} label="apis processor" sub="transform · standardize" name="ing-python" icon="/projects/tech/python.svg" tech="python" />
					<Node x={295} y={432} w={180} h={56} label="email processor" sub="inbox → S3" name="ing-email" icon="/projects/tech/python.svg" tech="python" />

					{/* Load */}
					<Node x={735} y={262} w={150} h={56} label="Airbyte" sub="S3 → Redshift" name="airbyte" icon="/skills/1st/Airbyte.svg" tech="Airbyte" />
					<Node x={735} y={362} w={150} h={56} label="COPY" sub="bulk file loads" name="copy" icon="/skills/1st/AWS%20Redshift.svg" tech="AWS Redshift" />

					{/* Warehouse contents (the frame itself is shared — it holds still
					    during the morph while these rows crossfade). */}
					<g className="pl-node" data-name="wh-ins">
						<text x={1055} y={192} textAnchor="middle" fill="#BF94FF" fontSize={17} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
							Redshift + dbt
						</text>
						<line x1={972} y1={212} x2={1138} y2={212} stroke="#9146FF" strokeOpacity={0.3} strokeWidth={1} />
						{/* Row icons sit so each icon+label pair centers on x=1055 —
						    the same axis the sub lines center on (label at 1069 =
						    1055 + half the icon+gap width; icon x from label length). */}
						<TechLink tech="AWS Redshift">
							<image href="/skills/1st/AWS%20Redshift.svg" x={1007} y={232} width={20} height={20} />
							<text x={1069} y={248} textAnchor="middle" fill="#DAD8E0" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								Redshift
							</text>
							<text x={1055} y={266} textAnchor="middle" fill="#807E8A" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								raw schemas + curated marts
							</text>
						</TechLink>
						<line x1={972} y1={292} x2={1138} y2={292} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
						<TechLink tech="dbt">
							<image href="/skills/1st/dbt.svg" x={999} y={312} width={20} height={20} />
							<text x={1069} y={328} textAnchor="middle" fill="#DAD8E0" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								dbt models
							</text>
							<text x={1055} y={346} textAnchor="middle" fill="#807E8A" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								stg → int → marts
							</text>
						</TechLink>
						<line x1={972} y1={372} x2={1138} y2={372} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
						<TechLink tech="Github">
							<image href="/skills/1st/Github.svg" x={1003} y={392} width={20} height={20} />
							<text x={1069} y={408} textAnchor="middle" fill="#DAD8E0" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								dbt CI/CD
							</text>
							<text x={1055} y={426} textAnchor="middle" fill="#807E8A" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								PR checks · deploy
							</text>
						</TechLink>
						<text x={1055} y={482} textAnchor="middle" fill="#34D399" fontSize={13} fontFamily={MONO_FONT} opacity={0.6} className={`pl-status ${LABEL_HIDDEN_MOBILE}`}>
							dbt run ✓
						</text>
					</g>

					{/* Consumers */}
					<Node x={1225} y={197} w={200} h={56} label="RTB ML model" sub="real-time bidding" name="con-rtb" stroke="#BF94FF" icon="/pipeline/kmeans.png" iconFilter="invert(1)" />
					<Node x={1225} y={312} w={200} h={56} label="Mode" sub="BI dashboards" name="con-mode" stroke="#BF94FF" icon="/skills/1st/Mode.svg" tech="Mode" />
					<Node x={1225} y={427} w={200} h={56} label="Hex" sub="notebooks · ad-hoc" name="con-hex" stroke="#BF94FF" icon="/skills/1st/Hex.svg" tech="Hex" />

					<TechLink tech="Apache Airflow">
						<text x={790} y={664} textAnchor="middle" fill="#BF94FF" fontSize={16} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
							Airflow on MWAA
						</text>
					</TechLink>

					<text x={720} y={768} textAnchor="middle" fill="#5C5A66" fontSize={11} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						solid = primary flow · dashed = direct paths · dotted = reverse ETL
					</text>

					{/* Data packets (one per path, driven by the loop timeline) */}
					<Packets v="ins" />
				</g>

				{/* ============ Infinite Lambda variant (hidden until the morph) ============ */}
				<g className="pl-v pl-v-il" style={{ opacity: 0, visibility: "hidden" }}>
					<Headings ingestion="managed elt" />
					<VariantEdges v="il" />
					<text
						x={710}
						y={165}
						textAnchor="middle"
						fill="#807E8A"
						fontSize={11}
						fontStyle="italic"
						fontFamily={MONO_FONT}
						className={LABEL_HIDDEN_MOBILE}
					>
						direct → Snowflake (skip S3)
					</text>

					{/* Sources — client-side systems a consultancy plugs into.
					    Five rows spread evenly across the same band the Insurify
					    view fills with six (no hole where the sixth row was). */}
					<Node x={30} y={102} w={200} h={56} label="client SaaS apps" sub="CRM · ads · billing" name="src-il-saas" icon="/pipeline/megaphone.svg" />
					<Node x={30} y={217} w={200} h={56} label="client databases" sub="Postgres · MySQL" name="src-il-db" icon="/projects/tech/PostgreSQL.svg" tech="PostgreSQL" />
					<Node x={30} y={332} w={200} h={56} label="client APIs" sub="REST · webhooks" name="src-il-api" icon="/pipeline/api.svg" />
					<Node x={30} y={447} w={200} h={56} label="event streams" sub="Snowplow · Segment" name="src-il-events" icon="/pipeline/snowplow.png" tech="Snowplow" />
					<Node x={30} y={562} w={200} h={56} label="flat files" sub="SFTP · spreadsheets" name="src-il-files" icon="/pipeline/files.svg" />

					{/* Ingestion — Fivetran collapses the whole fan into managed connectors.
					    Rendered as a tall container (the S3 treatment) since it replaces
					    both python processors and Airbyte from the Insurify view. */}
					<TechLink tech="Fivetran">
						<g className="pl-node" data-name="fivetran">
							<rect x={292} y={227} width={186} height={226} rx={15} fill="none" stroke="#3B82F6" strokeOpacity={0.1} strokeWidth={1.5} />
							<rect x={295} y={230} width={180} height={220} rx={12} fill="rgba(12, 11, 16, 0.82)" stroke="#3B82F6" strokeOpacity={0.45} strokeWidth={1.5} />
							<image href="/skills/1st/Fivetran.svg" x={361} y={268} width={48} height={48} />
							<text x={385} y={348} textAnchor="middle" fill="#60A5FA" fontSize={19} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								Fivetran
							</text>
							<text x={385} y={380} textAnchor="middle" fill="#807E8A" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								managed connectors
							</text>
							<text x={385} y={400} textAnchor="middle" fill="#807E8A" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								ELT · CDC
							</text>
						</g>
					</TechLink>

					{/* Load — a third tall container so the S3 → Snowflake leg reads
					    with the same weight as Fivetran and the lake beside it. */}
					<TechLink tech="Snowflake">
						<g className="pl-node" data-name="il-copy">
							<rect x={732} y={227} width={156} height={226} rx={15} fill="none" stroke="#29B5E8" strokeOpacity={0.1} strokeWidth={1.5} />
							<rect x={735} y={230} width={150} height={220} rx={12} fill="rgba(12, 11, 16, 0.82)" stroke="#29B5E8" strokeOpacity={0.45} strokeWidth={1.5} />
							<image href="/skills/1st/Snowflake.svg" x={786} y={268} width={48} height={48} />
							<text x={810} y={348} textAnchor="middle" fill="#29B5E8" fontSize={17} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								COPY INTO
							</text>
							<text x={810} y={380} textAnchor="middle" fill="#807E8A" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								S3 → Snowflake
							</text>
							<text x={810} y={400} textAnchor="middle" fill="#807E8A" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								external stages
							</text>
						</g>
					</TechLink>

					{/* Warehouse contents (shared frame) */}
					<g className="pl-node" data-name="wh-il">
						<text x={1055} y={192} textAnchor="middle" fill="#BF94FF" fontSize={17} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
							Snowflake + dbt
						</text>
						<line x1={972} y1={212} x2={1138} y2={212} stroke="#9146FF" strokeOpacity={0.3} strokeWidth={1} />
						<TechLink tech="Snowflake">
							<image href="/skills/1st/Snowflake.svg" x={1003} y={232} width={20} height={20} />
							<text x={1069} y={248} textAnchor="middle" fill="#DAD8E0" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								Snowflake
							</text>
							<text x={1055} y={266} textAnchor="middle" fill="#807E8A" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								raw · analytics schemas
							</text>
						</TechLink>
						<line x1={972} y1={292} x2={1138} y2={292} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
						<TechLink tech="dbt">
							<image href="/skills/1st/dbt.svg" x={999} y={312} width={20} height={20} />
							<text x={1069} y={328} textAnchor="middle" fill="#DAD8E0" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								dbt models
							</text>
							<text x={1055} y={346} textAnchor="middle" fill="#807E8A" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								stg → int → marts
							</text>
						</TechLink>
						<line x1={972} y1={372} x2={1138} y2={372} stroke="#9146FF" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 5" />
						<TechLink tech="Github">
							<image href="/skills/1st/Github.svg" x={1003} y={392} width={20} height={20} />
							<text x={1069} y={408} textAnchor="middle" fill="#DAD8E0" fontSize={14} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								dbt CI/CD
							</text>
							<text x={1055} y={426} textAnchor="middle" fill="#807E8A" fontSize={11.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								PR checks · deploy
							</text>
						</TechLink>
						<text x={1055} y={482} textAnchor="middle" fill="#34D399" fontSize={13} fontFamily={MONO_FONT} opacity={0.6} className={`pl-status ${LABEL_HIDDEN_MOBILE}`}>
							dbt build ✓
						</text>
					</g>

					{/* Consumers */}
					<Node x={1225} y={255} w={200} h={56} label="Omni" sub="BI · dashboards" name="con-omni" stroke="#BF94FF" icon="/skills/1st/Omni.webp" iconSize={34} tech="Omni" />
					<Node x={1225} y={369} w={200} h={56} label="client teams" sub="embedded · self-serve" name="con-clients" stroke="#BF94FF" icon="/pipeline/email.svg" />

					<TechLink tech="Apache Airflow">
						<text x={790} y={664} textAnchor="middle" fill="#BF94FF" fontSize={16} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
							Airflow
						</text>
					</TechLink>

					<text x={720} y={768} textAnchor="middle" fill="#5C5A66" fontSize={11} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						solid = primary flow · dashed = direct paths
					</text>

					<Packets v="il" />
				</g>

				{/* ============ Shared: painted last so the persistent pieces sit on
				    top of both variants' edges during the morph ============ */}
				<g className="pl-shared">
					{/* Lake */}
					<TechLink tech="S3">
						<g className="pl-node" data-name="s3">
							<rect x={532} y={227} width={146} height={226} rx={15} fill="none" stroke="#34D399" strokeOpacity={0.1} strokeWidth={1.5} />
							<rect x={535} y={230} width={140} height={220} rx={12} fill="rgba(12, 11, 16, 0.82)" stroke="#34D399" strokeOpacity={0.45} strokeWidth={1.5} />
							<image href="/skills/1st/S3.webp" x={581} y={255} width={48} height={48} />
							<text x={605} y={335} textAnchor="middle" fill="#34D399" fontSize={24} fontWeight="bold" fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								S3
							</text>
							<text x={605} y={368} textAnchor="middle" fill="#807E8A" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								raw archive
							</text>
							<text x={605} y={388} textAnchor="middle" fill="#807E8A" fontSize={12} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
								daily partitions
							</text>
						</g>
					</TechLink>

					{/* Warehouse frame — its contents live in the variant groups */}
					<g className="pl-node" data-name="warehouse">
						<rect x={942} y={147} width={226} height={386} rx={19} fill="none" stroke="#BF94FF" strokeOpacity={0.12} strokeWidth={1.5} />
						<rect x={945} y={150} width={220} height={380} rx={16} fill="rgba(145, 70, 255, 0.06)" stroke="#BF94FF" strokeOpacity={0.5} strokeWidth={1.5} />
					</g>

					{/* Orchestration bar (the title text is per-variant — Insurify runs
					    Airflow on MWAA, Infinite Lambda plain Airflow) */}
					<path d={ORCH_PATH} className="pl-orch-line" stroke="url(#pl-orch-grad)" strokeWidth={4} strokeLinecap="round" fill="none" />
					<polygon points="1230,678 1258,690 1230,702" fill="#BF94FF" className="pl-label" />
					<TechLink tech="Apache Airflow">
						<image href="/projects/tech/Apache%20Airflow.svg" x={678} y={643} width={28} height={28} />
					</TechLink>
					<text x={775} y={724} textAnchor="middle" fill="#807E8A" fontSize={12.5} fontFamily={MONO_FONT} className={LABEL_HIDDEN_MOBILE}>
						schedules ingestion · dbt runs · data-quality checks · CI/CD
					</text>
				</g>
			</g>
		</svg>
	);
};

const PipelineSection = () => {
	const [variant, setVariant] = useState<PipelineVariant>("ins");
	const [ready, setReady] = useState(false);
	const [morphing, setMorphing] = useState(false);
	// A manual pill click cancels the pending one-time auto-morph.
	const userTouchedRef = useRef(false);

	const handleChange = (v: PipelineVariant) => {
		userTouchedRef.current = true;
		setVariant(v);
		trackEvent("pipeline_variant", { variant: v, trigger: "click" });
	};

	const handleAutoMorph = useCallback(() => {
		if (userTouchedRef.current) return;
		setVariant("il");
		trackEvent("pipeline_variant", { variant: "il", trigger: "auto" });
	}, []);

	return (
		<section id="pipeline" className="relative z-10 w-full select-none">
			<div className="section-container relative flex flex-col items-center pb-24 pt-20 md:pb-32 md:pt-28">
				<SectionHeader
					index="01"
					eyebrow="Pipeline"
					title="How my data flows"
					align="center"
					className="mb-10 md:mb-12"
				/>
				<PipelineToggle variant={variant} disabled={!ready || morphing} onChange={handleChange} />
				<div className="mx-auto w-full max-w-7xl">
					<PipelineDag
						variant={variant}
						onAutoMorph={handleAutoMorph}
						onReady={() => setReady(true)}
						onMorphingChange={setMorphing}
					/>
				</div>
			</div>
		</section>
	);
};

export default PipelineSection;
