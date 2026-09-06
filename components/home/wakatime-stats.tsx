import React, { memo, useEffect, useRef, useState } from "react";
import { FaClock, FaCode, FaChartBar, FaLaptopCode } from "react-icons/fa";
import { SiWakatime } from "react-icons/si";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { trackEvent } from "../../utils/clarity";
import { prefersReducedMotion } from "../../utils/motion";

const WAKATIME_USERNAME = "MarkPham";

const HEATMAP_SRC =
	"https://wakatime.com/share/@MarkPham/50a82451-30d4-4552-a78e-2b7ed8f7083b.svg";

const trackWakatimeClick = (location: string) =>
	trackEvent("wakatime_click", { location });

const MONTH_LABELS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * The Wakatime share SVG spans the full tracking history (~2 years). Crop it
 * to the trailing 12 months: remove day cells older than a year, shift the
 * translated groups (day grid, month labels, legend) left, and shrink the
 * viewBox. The day-of-week label column (translate x = 0) stays put. Returns
 * null on any surprise so the caller can fall back to the raw embed.
 */
const cropHeatmapToLastYear = (svgText: string): string | null => {
	try {
		const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
		const svg = doc.documentElement;
		if (svg.nodeName !== "svg") return null;

		// Defense-in-depth for injected remote markup
		svg.querySelectorAll("script, foreignObject").forEach((el) => el.remove());
		svg.querySelectorAll("*").forEach((el) => {
			Array.from(el.attributes).forEach((attr) => {
				if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
			});
		});

		// Day cells are rects titled with a date ("Sep 9 2024")
		const dayRects = Array.from(svg.querySelectorAll("rect")).filter((r) =>
			!isNaN(Date.parse(r.querySelector("title")?.textContent || ""))
		);
		if (!dayRects.length) return null;

		const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
		let minKeptX = Infinity;
		dayRects.forEach((rect) => {
			const date = Date.parse(rect.querySelector("title")!.textContent!);
			if (date < cutoff) {
				rect.remove();
			} else {
				minKeptX = Math.min(minKeptX, parseFloat(rect.getAttribute("x") || "0"));
			}
		});
		const cropX = isFinite(minKeptX) ? minKeptX : 0;

		const width = parseFloat(svg.getAttribute("width") || "0");
		const height = parseFloat(svg.getAttribute("height") || "0");
		if (!width || !height) return null;

		Array.from(svg.children).forEach((child) => {
			if (child.nodeName !== "g") return;
			const m = /translate\(\s*([\d.]+)\s*,\s*([\d.]+)/.exec(
				child.getAttribute("transform") || ""
			);
			if (!m || parseFloat(m[1]) <= 0) return;
			child.setAttribute(
				"transform",
				`translate(${parseFloat(m[1]) - cropX}, ${m[2]})`
			);
			// Month labels now left of the crop (the legend's "Less"/"More" and
			// the Mon/Wed/Fri column don't match month names)
			Array.from(child.querySelectorAll("text")).forEach((t) => {
				const x = parseFloat(t.getAttribute("x") || "0");
				if (x < cropX && MONTH_LABELS.includes((t.textContent || "").trim())) {
					t.remove();
				}
			});
		});

		svg.setAttribute("viewBox", `0 0 ${width - cropX} ${height}`);
		svg.removeAttribute("width");
		svg.removeAttribute("height");
		svg.setAttribute("style", "width:100%;height:auto;display:block");

		return new XMLSerializer().serializeToString(svg);
	} catch {
		return null;
	}
};

/**
 * Daily-activity heatmap focused on the last 12 months. Falls back to the raw
 * (full-history) embed if the fetch/crop fails for any reason.
 */
const DailyActivityHeatmap = () => {
	const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		fetch(HEATMAP_SRC)
			.then((r) => (r.ok ? r.text() : Promise.reject(new Error("bad status"))))
			.then((text) => {
				if (cancelled) return;
				const cropped = cropHeatmapToLastYear(text);
				if (cropped) setSvgMarkup(cropped);
				else setFailed(true);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	if (failed) {
		return (
			<EmbedCard
				title="Daily Activity"
				trackLocation="activity_heatmap"
				src={HEATMAP_SRC}
				alt="Daily Activity Heatmap"
				imgClassName="w-full h-auto min-w-[600px]"
				scrollX
			/>
		);
	}

	return (
		<div className="relative rounded-xl overflow-hidden bg-gray-800/30 border border-gray-700/30 p-4">
			<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9146FF] via-[#BF94FF] to-[#9146FF] opacity-40" />
			<h4 className="text-sm font-medium text-gray-400 mb-4">
				Daily Activity <span className="text-gray-400">· last 12 months</span>
			</h4>
			<a
				href={`https://wakatime.com/@${WAKATIME_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackWakatimeClick("activity_heatmap")}
				className="block overflow-x-auto"
			>
				{svgMarkup ? (
					<div
						className="w-full min-w-[560px]"
						dangerouslySetInnerHTML={{ __html: svgMarkup }}
					/>
				) : (
					<div className="shimmer-loading h-24 rounded-lg" aria-hidden="true" />
				)}
			</a>
		</div>
	);
};

const STAT_CARD_CLASSES =
	"wk-stat-card flex items-center gap-4 p-4 rounded-xl border border-gray-700/30 hover:border-[#9146FF]/20 transition-all duration-[10ms] hover:scale-105";

const STAT_CARD_BG = {
	background: "linear-gradient(135deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.8))",
};

/**
 * Glass sub-card for a third-party Wakatime embed: purple top accent and a
 * shimmer skeleton until the remote SVG loads, so the embed feels intentional.
 */
const EmbedCard = ({
	title,
	trackLocation,
	src,
	alt,
	imgClassName = "w-full h-auto",
	scrollX = false,
}: {
	title: string;
	trackLocation: string;
	src: string;
	alt: string;
	imgClassName?: string;
	scrollX?: boolean;
}) => {
	const [loaded, setLoaded] = useState(false);

	return (
		<div className="relative rounded-xl overflow-hidden bg-gray-800/30 border border-gray-700/30 p-4">
			<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9146FF] via-[#BF94FF] to-[#9146FF] opacity-40" />
			<h4 className="text-sm font-medium text-gray-400 mb-4">{title}</h4>
			<a
				href={`https://wakatime.com/@${WAKATIME_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackWakatimeClick(trackLocation)}
				className={`block relative ${scrollX ? "overflow-x-auto" : ""}`}
			>
				{!loaded && (
					<div className="shimmer-loading absolute inset-0 rounded-lg" aria-hidden="true" />
				)}
				<img
					src={src}
					alt={alt}
					className={imgClassName}
					loading="lazy"
					onLoad={() => setLoaded(true)}
				/>
			</a>
		</div>
	);
};

const WakatimeStats = memo(() => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || prefersReducedMotion()) return;

		const cards = containerRef.current.querySelectorAll(".wk-stat-card");
		gsap.set(cards, { opacity: 0, y: 30 });

		const trigger = ScrollTrigger.create({
			trigger: containerRef.current,
			start: "top 85%",
			once: true,
			onEnter: () => {
				gsap.to(cards, {
					opacity: 1,
					y: 0,
					duration: 0.6,
					ease: "back.out(1.4)",
					stagger: 0.08,
				});
			},
		});

		return () => trigger.kill();
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full rounded-2xl p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:border-[#9146FF]/30 hover:shadow-[0_0_30px_-5px_rgba(145,70,255,0.15)] transition-all duration-[10ms]"
		>
			<a
				href={`https://wakatime.com/@${WAKATIME_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackWakatimeClick("header")}
				className="flex items-center gap-2 mb-6 group"
			>
				<SiWakatime className="text-2xl text-gray-300 group-hover:text-white transition-colors" />
				<span className="text-xl font-semibold text-gray-300 group-hover:text-white transition-colors">
					Wakatime Stats
				</span>
				<span className="text-gray-400 text-sm">@{WAKATIME_USERNAME}</span>
			</a>

			{/* Wakatime Coding Activity */}
			<div className="space-y-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_coding_activity")} className={STAT_CARD_CLASSES} style={STAT_CARD_BG}>
						<FaClock className="text-3xl text-blue-400" />
						<div>
							<p className="text-sm text-gray-400">Coding Activity</p>
							<p className="text-lg font-semibold text-white">Since Sep 2024</p>
						</div>
					</a>
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_tracking")} className={STAT_CARD_CLASSES} style={STAT_CARD_BG}>
						<FaCode className="text-3xl text-green-400" />
						<div>
							<p className="text-sm text-gray-400">Tracking</p>
							<p className="text-lg font-semibold text-white">All Projects</p>
						</div>
					</a>
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_daily_goal")} className={STAT_CARD_CLASSES} style={STAT_CARD_BG}>
						<FaChartBar className="text-3xl text-purple-400" />
						<div>
							<p className="text-sm text-gray-400">Daily Goal</p>
							<p className="text-lg font-semibold text-white">2+ Hours</p>
						</div>
					</a>
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_editor")} className={STAT_CARD_CLASSES} style={STAT_CARD_BG}>
						<FaLaptopCode className="text-3xl text-orange-400" />
						<div>
							<p className="text-sm text-gray-400">Main Editor</p>
							<p className="text-lg font-semibold text-white">Cursor</p>
						</div>
					</a>
				</div>

				{/* Languages & Categories Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<EmbedCard
						title="Languages"
						trackLocation="chart_languages"
						src="https://wakatime.com/share/@MarkPham/cc271ab9-a8ef-4c9b-ab6c-cd6d722a47e4.svg"
						alt="Languages Chart"
					/>
					<EmbedCard
						title="Categories"
						trackLocation="chart_categories"
						src="https://wakatime.com/share/@MarkPham/40277f04-b1e2-42ad-a86a-8e30e14d076a.svg"
						alt="Categories Chart"
					/>
				</div>

				{/* Activity Heatmap — cropped client-side to the last 12 months */}
				<DailyActivityHeatmap />
			</div>
		</div>
	);
});

WakatimeStats.displayName = "WakatimeStats";

export default WakatimeStats;
