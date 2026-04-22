import React, { memo } from "react";
import { FaClock, FaCode, FaChartBar, FaLaptopCode } from "react-icons/fa";
import { SiWakatime } from "react-icons/si";
import { trackEvent } from "../../utils/clarity";

const WAKATIME_USERNAME = "MarkPham";

const trackWakatimeClick = (location: string) =>
	trackEvent("wakatime_click", { location });

const WakatimeStats = memo(() => {
	return (
		<div className="w-full bg-gray-950 rounded-lg p-6 hover:bg-gray-900/50 transition-all duration-[10ms]">
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
				<span className="text-gray-500 text-sm">@{WAKATIME_USERNAME}</span>
			</a>

			{/* Wakatime Coding Activity */}
			<div className="space-y-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_coding_activity")} className="flex items-center gap-4 p-4 rounded-lg border border-gray-700/30 hover:border-[#9146FF]/20 transition-all duration-[10ms] hover:scale-105" style={{ background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.8))' }}>
						<FaClock className="text-3xl text-blue-400" />
						<div>
							<p className="text-sm text-gray-400">Coding Activity</p>
							<p className="text-lg font-semibold text-white">Since Sep 2024</p>
						</div>
					</a>
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_tracking")} className="flex items-center gap-4 p-4 rounded-lg border border-gray-700/30 hover:border-[#9146FF]/20 transition-all duration-[10ms] hover:scale-105" style={{ background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.8))' }}>
						<FaCode className="text-3xl text-green-400" />
						<div>
							<p className="text-sm text-gray-400">Tracking</p>
							<p className="text-lg font-semibold text-white">All Projects</p>
						</div>
					</a>
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_daily_goal")} className="flex items-center gap-4 p-4 rounded-lg border border-gray-700/30 hover:border-[#9146FF]/20 transition-all duration-[10ms] hover:scale-105" style={{ background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.8))' }}>
						<FaChartBar className="text-3xl text-purple-400" />
						<div>
							<p className="text-sm text-gray-400">Daily Goal</p>
							<p className="text-lg font-semibold text-white">2+ Hours</p>
						</div>
					</a>
					<a href={`https://wakatime.com/@${WAKATIME_USERNAME}`} target="_blank" rel="noopener noreferrer" onClick={() => trackWakatimeClick("stat_editor")} className="flex items-center gap-4 p-4 rounded-lg border border-gray-700/30 hover:border-[#9146FF]/20 transition-all duration-[10ms] hover:scale-105" style={{ background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.8))' }}>
						<FaLaptopCode className="text-3xl text-orange-400" />
						<div>
							<p className="text-sm text-gray-400">Main Editor</p>
							<p className="text-lg font-semibold text-white">Cursor</p>
						</div>
					</a>
				</div>

				{/* Languages & Categories Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Languages Chart */}
					<div className="bg-gray-800/30 rounded-lg p-4">
						<h4 className="text-sm font-medium text-gray-400 mb-4">Languages</h4>
						<a
							href={`https://wakatime.com/@${WAKATIME_USERNAME}`}
							target="_blank"
							rel="noopener noreferrer"
							onClick={() => trackWakatimeClick("chart_languages")}
							className="block"
						>
							<img
								src="/api/wakatime/cc271ab9-a8ef-4c9b-ab6c-cd6d722a47e4"
								alt="Languages Chart"
								className="w-full h-auto"
								loading="lazy"
								decoding="async"
								width={575}
								height={180}
							/>
						</a>
					</div>

					{/* Categories Chart */}
					<div className="bg-gray-800/30 rounded-lg p-4">
						<h4 className="text-sm font-medium text-gray-400 mb-4">Categories</h4>
						<a
							href={`https://wakatime.com/@${WAKATIME_USERNAME}`}
							target="_blank"
							rel="noopener noreferrer"
							onClick={() => trackWakatimeClick("chart_categories")}
							className="block"
						>
							<img
								src="/api/wakatime/40277f04-b1e2-42ad-a86a-8e30e14d076a"
								alt="Categories Chart"
								className="w-full h-auto"
								loading="lazy"
								decoding="async"
								width={575}
								height={180}
							/>
						</a>
					</div>
				</div>

				{/* Activity Heatmap */}
				<div className="bg-gray-800/30 rounded-lg p-4">
					<h4 className="text-sm font-medium text-gray-400 mb-4">Daily Activity</h4>
					<a
						href={`https://wakatime.com/@${WAKATIME_USERNAME}`}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => trackWakatimeClick("activity_heatmap")}
						className="block overflow-x-auto"
					>
						<img
							src="/api/wakatime/50a82451-30d4-4552-a78e-2b7ed8f7083b"
							alt="Daily Activity Heatmap"
							className="w-full h-auto min-w-[600px]"
							loading="lazy"
							decoding="async"
							width={800}
							height={150}
						/>
					</a>
				</div>
			</div>
		</div>
	);
});

WakatimeStats.displayName = "WakatimeStats";

export default WakatimeStats;
