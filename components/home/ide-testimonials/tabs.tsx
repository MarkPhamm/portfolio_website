import React from "react";
import { VscMarkdown, VscClose } from "react-icons/vsc";
import { folderColor, ITestimonialFile } from "./files";

const Tabs = ({
	tabs,
	activeId,
	onSelect,
	onClose,
}: {
	tabs: ITestimonialFile[];
	activeId: string | null;
	onSelect: (id: string) => void;
	onClose: (id: string) => void;
}) => (
	<div
		className="flex overflow-x-auto ide-scroll border-b border-line bg-surface-2/60"
			data-lenis-prevent-horizontal
		role="tablist"
		aria-label="Open recommendation files"
	>
		{tabs.map((tab) => {
			const isActive = tab.id === activeId;
			return (
				<div
					key={tab.id}
					role="tab"
					aria-selected={isActive}
					tabIndex={0}
					onClick={() => onSelect(tab.id)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onSelect(tab.id);
						}
					}}
					className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-2 font-mono text-xs whitespace-nowrap cursor-pointer border-r border-gray-800/70 border-t-2 transition-colors duration-[10ms] ${
						isActive
							? "bg-surface-1 text-ink-1 border-t-violet-soft"
							: "bg-gray-900/60 text-gray-400 border-t-transparent hover:text-gray-200"
					}`}
				>
					<VscMarkdown
						className="text-sm shrink-0"
						style={{
							color: folderColor(tab.folder),
							opacity: isActive ? 1 : 0.6,
						}}
						aria-hidden="true"
					/>
					{tab.fileName}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onClose(tab.id);
						}}
						aria-label={`Close ${tab.fileName}`}
						className={`p-0.5 rounded hover:bg-gray-700/70 transition-colors duration-[10ms] ${
							isActive
								? "text-gray-400 hover:text-white"
								: "text-transparent group-hover:text-gray-500 hover:!text-white"
						}`}
					>
						<VscClose className="text-sm" />
					</button>
				</div>
			);
		})}
	</div>
);

export default Tabs;
