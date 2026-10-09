import React from "react";
import GitHubStats from "./github-stats";
import WakatimeStats from "./wakatime-stats";
import SectionHeader from "../common/section-header";

const ActivitySection = () => (
	<section
		className="w-full relative select-none section-container py-24 md:py-36 flex flex-col"
		id="activity"
	>
		<SectionHeader
			index="07"
			eyebrow="My Activity"
			title="My Activity"
			inlineTagline="coding stats & contributions"
			className="relative mb-12 md:mb-16"
		/>

		<div className="flex flex-col gap-8 relative">
			<GitHubStats />
			<WakatimeStats />
		</div>
	</section>
);

export default ActivitySection;
