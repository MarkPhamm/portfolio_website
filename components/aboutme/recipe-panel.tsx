import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../../utils/motion";
import { Recipe, formatMinutes } from "../../utils/recipes";

interface RecipeEntry {
	open: boolean;
	done: boolean[];
}

interface RecipeStore {
	entries: Record<string, RecipeEntry>;
	toggleOpen: (slug: string, stepCount: number) => void;
	toggleStep: (slug: string, index: number, stepCount: number) => void;
	resetSteps: (slug: string, stepCount: number) => void;
}

const RecipeStoreContext = createContext<RecipeStore | null>(null);

const blankEntry = (stepCount: number): RecipeEntry => ({
	open: false,
	done: new Array(stepCount).fill(false),
});

/**
 * Panel state lives above the dish cards because the category tabs unmount
 * whole sections — keeping it local would silently collapse every open recipe
 * (and lose the checked-off steps) the moment someone switches filters.
 */
export const RecipeStoreProvider = ({ children }: { children: React.ReactNode }) => {
	const [entries, setEntries] = useState<Record<string, RecipeEntry>>({});

	const toggleOpen = useCallback((slug: string, stepCount: number) => {
		setEntries((prev) => {
			const entry = prev[slug] || blankEntry(stepCount);
			return { ...prev, [slug]: { ...entry, open: !entry.open } };
		});
	}, []);

	const toggleStep = useCallback((slug: string, index: number, stepCount: number) => {
		setEntries((prev) => {
			const entry = prev[slug] || blankEntry(stepCount);
			const done = entry.done.slice();
			done[index] = !done[index];
			return { ...prev, [slug]: { ...entry, done } };
		});
	}, []);

	const resetSteps = useCallback((slug: string, stepCount: number) => {
		setEntries((prev) => {
			const entry = prev[slug] || blankEntry(stepCount);
			return { ...prev, [slug]: { ...entry, done: new Array(stepCount).fill(false) } };
		});
	}, []);

	const value = useMemo(
		() => ({ entries, toggleOpen, toggleStep, resetSteps }),
		[entries, toggleOpen, toggleStep, resetSteps]
	);

	return (
		<RecipeStoreContext.Provider value={value}>{children}</RecipeStoreContext.Provider>
	);
};

const MetaChip = ({ label, value }: { label: string; value: string }) => (
	<div className="recipe-chip flex flex-col rounded-xl bg-gray-900/60 border border-gray-700/50 px-4 py-2">
		<span className="text-[0.65rem] uppercase tracking-widest text-gray-400">{label}</span>
		<span className="text-sm font-semibold text-white">{value}</span>
	</div>
);

/**
 * Rendered at the end of the dish description rather than under the card, so
 * the disclosure doesn't cost a full empty row next to the image.
 */
export const RecipeToggle = ({ recipe }: { recipe: Recipe }) => {
	const store = useContext(RecipeStoreContext);
	if (!store) return null;

	const open = store.entries[recipe.slug]?.open ?? false;

	return (
		<button
			type="button"
			onClick={() => store.toggleOpen(recipe.slug, recipe.steps.length)}
			aria-expanded={open}
			aria-controls={`recipe-${recipe.slug}`}
			className={`card-shine inline-block px-5 py-2 rounded-full text-sm font-medium tracking-wide border transition-all duration-300 ${
				open
					? "bg-[#f27d0d] text-white border-[#f27d0d] shadow-lg shadow-[#f27d0d]/30"
					: "bg-transparent text-[#f27d0d] border-[#f27d0d]/40 hover:bg-[#f27d0d]/10 hover:border-[#f27d0d] hover:-translate-y-0.5"
			}`}
		>
			{open ? "Hide Recipe" : "View Recipe"}
		</button>
	);
};

const RecipePanel = ({ recipe }: { recipe: Recipe }) => {
	const store = useContext(RecipeStoreContext);
	const stepCount = recipe.steps.length;
	const entry = store?.entries[recipe.slug];
	const open = entry?.open ?? false;
	const done = entry?.done ?? new Array(stepCount).fill(false);
	const doneCount = done.filter(Boolean).length;

	const bodyRef = useRef<HTMLDivElement>(null);
	const mounted = useRef(false);

	useEffect(() => {
		const el = bodyRef.current;
		if (!el) return;

		// Skip the tween on the very first pass so a panel re-mounted by the
		// category filter reopens instantly instead of replaying its entrance.
		if (!mounted.current || prefersReducedMotion()) {
			mounted.current = true;
			gsap.set(el, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0 });
			return;
		}

		const tl = gsap.timeline();
		if (open) {
			tl.to(el, { height: "auto", autoAlpha: 1, duration: 0.45, ease: "power2.inOut" })
				.from(
					el.querySelectorAll(".recipe-chip"),
					{ opacity: 0, y: 10, scale: 0.9, duration: 0.3, stagger: 0.03, ease: "back.out(2)" },
					"-=0.22"
				)
				.from(
					el.querySelectorAll(".recipe-rail"),
					{ scaleY: 0, duration: 0.55, ease: "power2.out" },
					"-=0.1"
				)
				.from(
					el.querySelectorAll(".recipe-step"),
					{ opacity: 0, x: -18, duration: 0.35, stagger: 0.06, ease: "power3.out" },
					"<"
				);
		} else {
			tl.to(el, { height: 0, autoAlpha: 0, duration: 0.35, ease: "power2.inOut" });
		}

		return () => {
			tl.kill();
		};
	}, [open]);

	if (!store) return null;

	const panelId = `recipe-${recipe.slug}`;
	const progress = stepCount ? (doneCount / stepCount) * 100 : 0;

	return (
		<div
			id={panelId}
			ref={bodyRef}
			role="region"
			aria-label={`${recipe.name} recipe`}
			className="overflow-hidden"
			style={{ height: 0, visibility: "hidden" }}
		>
			{/* Margin lives inside the collapsing element so a closed panel
			    adds no gap between dish cards, and stays tight so the toggle
			    reads as attached to the panel it controls. */}
			<div className="mt-3 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 border-l-4 border-l-[#f27d0d] p-6 md:p-8">
					<div className="relative inline-block mb-6">
						<span className="recipe-steam" aria-hidden="true">
							<span />
							<span />
							<span />
						</span>
						<h4 className="text-xl font-bold text-white">{recipe.name}</h4>
					</div>

					<div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-8">
						<MetaChip label="Prep" value={formatMinutes(recipe.prepMinutes)} />
						<MetaChip label="Cook" value={formatMinutes(recipe.cookMinutes)} />
						<MetaChip label="Serves" value={`${recipe.serves}`} />
						<MetaChip label="Difficulty" value={recipe.difficulty} />
					</div>

					{recipe.prepNote && (
						<p className="-mt-6 mb-8 text-sm text-gray-400 italic">
							Prep time is {recipe.prepNote}.
						</p>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
						<div className="lg:col-span-2">
							<h5 className="text-sm uppercase tracking-widest text-[#f27d0d] font-semibold mb-4">
								Ingredients
							</h5>
							{recipe.ingredients.map((group, groupIndex) => (
								<div key={groupIndex} className={groupIndex ? "mt-5" : ""}>
									{group.group && (
										<p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
											{group.group}
										</p>
									)}
									<ul className="flex flex-wrap gap-2">
										{group.items.map((item) => (
											<li
												key={item}
												className="recipe-chip text-sm text-gray-200 bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-1.5 hover:border-[#f27d0d]/50 hover:-translate-y-0.5 hover:text-white transition-all duration-300"
											>
												{item}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						<div className="lg:col-span-3">
							<div className="flex items-baseline justify-between mb-4">
								<h5 className="text-sm uppercase tracking-widest text-[#f27d0d] font-semibold">
									Method
								</h5>
								<span className="text-xs text-gray-400">
									{doneCount} of {stepCount} steps
								</span>
							</div>

							<div className="h-1 w-full rounded-full bg-gray-700/60 mb-6 overflow-hidden">
								<div
									className="h-full rounded-full bg-gradient-to-r from-[#f27d0d] to-[#ff9a3c] transition-all duration-500 ease-out"
									style={{ width: `${progress}%` }}
								/>
							</div>

							<div className="relative pl-10">
								<div className="recipe-rail absolute left-[0.9375rem] top-2 bottom-2 w-px bg-gray-700 origin-top" />
								<div
									className="recipe-rail-fill absolute left-[0.9375rem] top-2 bottom-2 w-px bg-[#f27d0d] origin-top transition-transform duration-500 ease-out"
									style={{ transform: `scaleY(${stepCount ? doneCount / stepCount : 0})` }}
								/>
								<ol className="space-y-4">
									{recipe.steps.map((step, index) => (
										<li key={index} className="recipe-step">
											<button
												type="button"
												onClick={() => store.toggleStep(recipe.slug, index, stepCount)}
												aria-pressed={done[index]}
												className="group flex w-full gap-4 text-left"
											>
												<span
													className={`shrink-0 -ml-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
														done[index]
															? "bg-[#f27d0d] text-white scale-95"
															: "bg-gray-900 text-[#f27d0d] border border-[#f27d0d]/40 group-hover:border-[#f27d0d] group-hover:scale-110"
													}`}
												>
													{index + 1}
												</span>
												<span
													className={`text-base md:text-lg leading-relaxed transition-all duration-300 ${
														done[index]
															? "text-gray-500 line-through"
															: "text-gray-300 group-hover:text-white"
													}`}
												>
													{step}
												</span>
											</button>
										</li>
									))}
								</ol>
							</div>

							{doneCount > 0 && (
								<button
									type="button"
									onClick={() => store.resetSteps(recipe.slug, stepCount)}
									className="mt-5 text-sm text-gray-400 hover:text-[#f27d0d] underline underline-offset-4 transition-colors duration-300"
								>
									Reset steps
								</button>
							)}
						</div>
					</div>

					{recipe.tip && (
						<p className="mt-8 pt-6 border-t border-gray-700/50 text-gray-300 leading-relaxed">
							<span className="text-[#f27d0d] font-semibold">Chef&apos;s note — </span>
							{recipe.tip}
						</p>
					)}
			</div>
		</div>
	);
};

export default RecipePanel;
