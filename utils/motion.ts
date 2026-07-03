// Shared motion helpers. `NO_MOTION_PREFERENCE_QUERY` historically lives as an
// export of pages/index.tsx — new code should import from here instead so
// motion utilities don't depend on a page module.
export const NO_MOTION_PREFERENCE_QUERY =
	"(prefers-reduced-motion: no-preference)";

export const prefersReducedMotion = (): boolean =>
	typeof window !== "undefined" &&
	!window.matchMedia(NO_MOTION_PREFERENCE_QUERY).matches;
