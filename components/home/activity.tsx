import React from "react";
import GitHubStats from "./github-stats";
import WakatimeStats from "./wakatime-stats";

const ActivitySection = () => {
	return (
		<section
			className="w-full relative select-none section-container py-8 md:py-12 flex flex-col"
			id="activity"
		>
			<div className="flex flex-col mb-10">
				<h2 className="section-heading seq">My Activity</h2>
				<h3 className="text-2xl md:max-w-2xl w-full seq mt-2">
					Coding stats & contributions
				</h3>
			</div>

			<div className="flex flex-col gap-8">
				<GitHubStats />
				<WakatimeStats />
			</div>
		</section>
	);
};

export default ActivitySection;
