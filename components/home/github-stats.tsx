import React, { useEffect, useState, useCallback, memo } from "react";
import { FaGithub, FaStar, FaCodeBranch, FaUsers, FaBook } from "react-icons/fa";
import CountUp from "react-countup";
import { trackEvent } from "../../utils/clarity";

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

const GitHubStats = memo(() => {
	const [stats, setStats] = useState<GitHubStatsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isVisible] = useState(true);

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

	const StatCard = ({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: number; delay: number }) => (
		<a
			href={`https://github.com/${GITHUB_USERNAME}`}
			target="_blank"
			rel="noopener noreferrer"
			onClick={() => trackEvent("github_stats_click", { location: `stat_card_${label.toLowerCase().replace(/\s+/g, "_")}` })}
			className={`flex flex-col items-center justify-center p-4 rounded-lg hover:scale-105 transition-all duration-[10ms] cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
				}`}
			style={{
				transitionDelay: `${delay}ms`,
				background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
				border: '1px solid rgba(145, 70, 255, 0.15)',
			}}
		>
			<div className="text-2xl mb-2 text-[#9146FF]">{icon}</div>
			<div className="text-2xl font-bold text-white"><CountUp end={value} duration={2} separator="," /></div>
			<div className="text-sm text-gray-300">{label}</div>
		</a>
	);

	if (loading) {
		return (
			<div className="w-full bg-gray-950 rounded-lg p-6 animate-pulse">
				<div className="flex items-center gap-2 mb-4">
					<div className="w-6 h-6 bg-gray-800 rounded"></div>
					<div className="h-6 w-32 bg-gray-800 rounded"></div>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
					))}
				</div>
				<div className="h-32 bg-gray-800 rounded-lg"></div>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className="w-full bg-gray-950 rounded-lg p-6 text-center">
				<p className="text-gray-400">{error || "Unable to load GitHub stats"}</p>
			</div>
		);
	}

	return (
		<div
			className={`w-full bg-gray-950 rounded-lg p-6 hover:bg-gray-900/50 transition-all duration-[10ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
				}`}
		>
			<a
				href={`https://github.com/${GITHUB_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackEvent("github_stats_click", { location: "header" })}
				className="flex items-center gap-2 mb-6 group"
			>
				<FaGithub className="text-2xl text-gray-300 group-hover:text-white transition-colors" />
				<span className="text-xl font-semibold text-gray-300 group-hover:text-white transition-colors">
					GitHub Stats
				</span>
				<span className="text-gray-500 text-sm">@{GITHUB_USERNAME}</span>
			</a>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
				<StatCard icon={<FaBook />} label="Repositories" value={stats.repos} delay={100} />
				<StatCard icon={<FaStar />} label="Total Stars" value={stats.stars} delay={200} />
				<StatCard icon={<FaUsers />} label="Followers" value={stats.followers} delay={300} />
				<StatCard icon={<FaCodeBranch />} label="Following" value={stats.following} delay={400} />
			</div>

			{/* Language Stats */}
			<a
				href={`https://github.com/${GITHUB_USERNAME}`}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => trackEvent("github_stats_click", { location: "languages" })}
				className={`block mt-4 transition-all duration-[10ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
					}`}
				style={{ transitionDelay: '500ms' }}
			>
				<h4 className="text-sm font-medium text-gray-400 mb-3">Most Used Languages</h4>
				<div className="space-y-3">
					{stats.languages.map((lang, index) => (
						<div
							key={lang.name}
							className={`group transition-all duration-[10ms] ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
								}`}
							style={{ transitionDelay: `${600 + index * 100}ms` }}
						>
							<div className="flex justify-between items-center mb-1">
								<div className="flex items-center gap-2">
									<span
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: lang.color }}
									></span>
									<span className="text-sm text-gray-300">{lang.name}</span>
								</div>
								<span className="text-sm text-gray-500">{lang.percentage}%</span>
							</div>
							<div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
								<div
									className="h-full rounded-full transition-all duration-[10ms] ease-out"
									style={{
										width: isVisible ? `${lang.percentage}%` : '0%',
										backgroundColor: lang.color,
										transitionDelay: `${700 + index * 100}ms`,
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
				className="block mt-6 pt-6 border-t border-gray-800"
			>
				<h4 className="text-sm font-medium text-gray-400 mb-4">Contribution Activity</h4>
				<img
					src={`https://ghchart.rshah.org/9146FF/${GITHUB_USERNAME}`}
					alt="GitHub Contribution Calendar"
					className="w-full h-auto rounded-lg"
					style={{ filter: 'invert(1) hue-rotate(180deg)', opacity: 0.85 }}
					loading="lazy"
				/>
			</a>
		</div>
	);
});

GitHubStats.displayName = "GitHubStats";

export default GitHubStats;
