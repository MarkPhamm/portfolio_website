import React from "react";

export type PipelineVariant = "ins" | "il";

const OPTIONS: { id: PipelineVariant; label: string }[] = [
	{ id: "ins", label: "Insurify" },
	{ id: "il", label: "Infinite Lambda" },
];

// Glass segmented control between the two pipeline architectures.
// Disabled until the diagram's entrance has drawn and while a morph is running.
const PipelineToggle = ({
	variant,
	disabled,
	onChange,
}: {
	variant: PipelineVariant;
	disabled: boolean;
	onChange: (variant: PipelineVariant) => void;
}) => {
	const basePill =
		"flex-none rounded-full border px-4 py-1.5 text-xs font-medium transition-colors duration-[10ms] cursor-pointer disabled:cursor-default md:text-[13px]";

	return (
		<div
			className="glass mb-6 inline-flex items-center gap-1 rounded-full p-1 md:mb-8"
			role="group"
			aria-label="Pipeline architecture view"
		>
			{OPTIONS.map(({ id, label }) => (
				<button
					key={id}
					type="button"
					aria-pressed={variant === id}
					disabled={disabled}
					onClick={() => {
						if (variant !== id) onChange(id);
					}}
					className={`${basePill} ${
						variant === id
							? "border-white/10 bg-white/[0.09] text-ink-1"
							: "border-transparent text-ink-2 hover:text-ink-1"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
};

export default PipelineToggle;
