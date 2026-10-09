import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { FaGithub, FaStar, FaCodeBranch, FaUsers, FaBook } from "react-icons/fa";
import CountUp from "react-countup";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { trackEvent } from "../../utils/clarity";
import { EASE, prefersReducedMotion } from "../../utils/motion";

interface GitHubUser {
	public_repos: number;
	followers: number;
	following: number;
}

interface GitHubRepo {
	stargazers_count: number;
	language: string | null;
	fork: boolean;
}

interface LanguageStat {
	name: string;
	count: number;
	percentage: number;
	color: string;
}

interface GitHubStatsData {
	repos: number;
	followers: number;
	following: number;
	stars: number;
	languages: LanguageStat[];
}

const LANGUAGE_COLORS: Record<string, string> = {
	Python: "#3572A5",
	JavaScript: "#f1e05a",
	TypeScript: "#3178c6",
	HTML: "#e34c26",
	CSS: "#563d7c",
	Jupyter: "#DA5B0B",
	"Jupyter Notebook": "#DA5B0B",
	Shell: "#89e051",
	SQL: "#e38c00",
	Go: "#00ADD8",
	Rust: "#dea584",
	Java: "#b07219",
	"C++": "#f34b7d",
	C: "#555555",
	Ruby: "#701516",
	PHP: "#4F5D95",
	Swift: "#ffac45",
	Kotlin: "#A97BFF",
	Scala: "#c22d40",
	R: "#198CE7",
	MATLAB: "#e16737",
	Dockerfile: "#384d54",
	HCL: "#844FBA",
	PLpgSQL: "#336790",
};

const GITHUB_USERNAME = "MarkPhamm";

const PANEL_CLASSES =
	"w-full rounded-[24px] p-6 md:p-8 bg-surface-1/70 border border-line shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] hover:border-line-strong transition-colors duration-[10ms]";

const GitHubStats = memo(() => {
	const [stats, setStats] = useState<GitHubStatsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [inView, setInView] = useState(false);
	// Reduced motion: numbers land on their final value, no count-up.
	const [instant, setInstant] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const fetchGitHubStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch user data and repos in parallel
			const [userResponse, reposResponse] = await Promise.all([
				fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
				fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`),
			]);

			if (!userResponse.ok || !reposResponse.ok) {
				throw new Error("Failed to fetch GitHub data");
			}

			const userData: GitHubUser = await userResponse.json();
			const reposData: GitHubRepo[] = await reposResponse.json();

			// Calculate total stars (excluding forks)
			const totalStars = reposData
				.filter((repo) => !repo.fork)
				.reduce((sum, repo) => sum + repo.stargazers_count, 0);

			// Calculate language statistics
			const languageCounts: Record<string, number> = {};
			reposData
				.filter((repo) => !repo.fork && repo.language)
				.forEach((repo) => {
					const lang = repo.language!;
					languageCounts[lang] = (languageCounts[lang] || 0) + 1;
				});

			const totalReposWithLang = Object.values(languageCounts).reduce((a, b) => a + b, 0);
			const languages: LanguageStat[] = Object.entries(languageCounts)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 5)
				.map(([name, count]) => ({
					name,
					count,
					percentage: Math.round((count / totalReposWithLang) * 100),
					color: LANGUAGE_COLORS[name] || "#6e7681",
				}));

			setStats({
				repos: userData.public_repos,
				followers: userData.followers,
				following: userData.following,
				stars: totalStars,
				languages,
			});
		} catch (err) {
			setError("Failed to load GitHub stats");
			} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchGitHubStats();
	}, [fetchGitHubStats]);

	// Entrance choreography: stat cards pop in, language rows slide in and
	// their bars grow, all once the loaded panel scrolls into view.
	useEffect(() => {
		if (loading || !stats || !containerRef.current) return;

		if (prefersReducedMotion()) {
			setInstant(true);
			setInView(true);
			return;
		}

		const el = containerRef.current;
		const cards = el.querySelectorAll(".gh-stat-card");
		const rows = el.querySelectorAll(".gh-lang-row");
		const bars = el.querySelectorAll(".gh-lang-bar");

		gsap.set(cards, { opacity: 0, y: 30 });
		gsap.set(rows, { opacity: 0, x: -16 });

		const trigger = ScrollTrigger.create({
			trigger: el,
			start: "top 85%",
			once: true,
			onEnter: () => {
				setInView(true);
				gsap.to(cards, {
					opacity: 1,
					y: 0,
					duration: 0.6,
					ease: EASE.out,
					stagger: 0.05,
				});
				gsap.to(rows, {
					opacity: 1,
					x: 0,
					duration: 0.5,
					ease: EASE.out,
					stagger: 0.05,
					delay: 0.1,
				});
				gsap.from(bars, {
					width: 0,
					duration: 0.8,
					ease: EASE.out,
					stagger: 0.06,
					delay: 0.15,
				});
			},
		});

		return () => trigger.kill();
	}, [loading, stats]);

	const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
		<a
			href={`https://github.com/${GITHUB_USERNAME}`}
			target="_blank"
			rel="noopener noreferrer"
			onClick={() => trackEvent("github_stats_click", { location: `stat_card_${label.toLowerCase().replace(/\s+/g, "_")}` })}
			className="gh-stat-card flex flex-col items-start justify-between gap-8 bg-surface-1 p-5 md:p-6 cursor-pointer transition-colors duration-[10ms] hover:bg-surface-2"
		>
			<div className="text-sm text-ink-3">{icon}</div>
			<div>
				<div className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-ink-1 tabular-nums">
					{inView ? (
						instant ? value.toLocaleString() : <CountUp end={value} duration={2} separator="," />
					) : (
						<span>0</span>
					)}
				</div>
				<div className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">{label}</div>
			</div>
		</a>
	);

	if (loading) {
		return (
			<div className={`${PANEL_CLASSES} animate-pulse`}>
				<div className="flex items-center gap-2 mb-6">
					<div className="w-6 h-6 bg-white/[0.05] rounded"></div>
					<div className="h-6 w-32 bg-white/[0.05] rounded"></div>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-32 bg-white/[0.04] rounded-xl"></div>
					))}
				</div>
				<div className="h-32 bg-white/[0.04] rounded-xl"></div>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className={`${PANEL_CLASSES} text-center`}>
				<p className="text-ink-3">{error || "Unable to load GitHub stats"}</p>
			</div>
		);
	}

	return (
		<div ref={containerRef} className={PANEL_CLASSES}>
			<a
				href={`https://github.com/${GITHUB_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackEvent("github_stats_click", { location: "header" })}
				className="flex items-center gap-3 mb-8 group"
			>
				<FaGithub className="text-xl text-ink-2 group-hover:text-ink-1 transition-colors duration-[10ms]" />
				<span className="text-lg font-normal tracking-[-0.01em] text-ink-1">
					GitHub Stats
				</span>
				<span className="font-mono text-[11px] tracking-[0.08em] text-ink-3">@{GITHUB_USERNAME}</span>
			</a>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line mb-10">
				<StatCard icon={<FaBook />} label="Repositories" value={stats.repos} />
				<StatCard icon={<FaStar />} label="Total Stars" value={stats.stars} />
				<StatCard icon={<FaUsers />} label="Followers" value={stats.followers} />
				<StatCard icon={<FaCodeBranch />} label="Following" value={stats.following} />
			</div>

			{/* Language Stats */}
			<a
				href={`https://github.com/${GITHUB_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackEvent("github_stats_click", { location: "languages" })}
				className="block"
			>
				<h3 className="mono-label mb-5">Most used languages</h3>
				<div className="space-y-4">
					{stats.languages.map((lang) => (
						<div key={lang.name} className="gh-lang-row group">
							<div className="flex justify-between items-center mb-1">
								<div className="flex items-center gap-2">
									<span
										className="w-2 h-2 rounded-full"
										style={{ backgroundColor: lang.color }}
									></span>
									<span className="text-sm text-ink-2">{lang.name}</span>
								</div>
								<span className="font-mono text-[11px] text-ink-3">{lang.percentage}%</span>
							</div>
							<div className="w-full bg-white/[0.08] rounded-full h-[2px] overflow-hidden">
								<div
									className="gh-lang-bar h-full rounded-full"
									style={{
										width: `${lang.percentage}%`,
										backgroundColor: lang.color,
									}}
								></div>
							</div>
						</div>
					))}
				</div>
			</a>

			{/* Contribution Activity */}
			<a
				href={`https://github.com/${GITHUB_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackEvent("github_stats_click", { location: "contributions" })}
				className="block mt-10 pt-8 border-t border-line"
			>
				<h3 className="mono-label mb-5">Contribution activity</h3>
				<div className="rounded-2xl border border-line bg-surface-2 p-4 md:p-5">
				<img
					src={`https://ghchart.rshah.org/9146FF/${GITHUB_USERNAME}`}
					alt="GitHub Contribution Calendar"
					className="w-full h-auto rounded-lg"
					style={{ filter: 'invert(1) hue-rotate(180deg)', opacity: 0.85 }}
					loading="lazy"
				/>
				</div>
			</a>
		</div>
	);
});

GitHubStats.displayName = "GitHubStats";

export default GitHubStats;
