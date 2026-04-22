export const GA_MEASUREMENT_ID = "G-FH792RMCK7";

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
		dataLayer?: unknown[];
	}
}

function gtag(...args: unknown[]): void {
	if (typeof window === "undefined") return;
	if (typeof window.gtag !== "function") return;
	window.gtag(...args);
}

export function pageview(url: string): void {
	gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

export function event(name: string, params?: GtagParams): void {
	gtag("event", name, params ?? {});
}
