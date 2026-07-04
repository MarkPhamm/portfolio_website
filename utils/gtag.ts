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
	if (typeof window === "undefined") return;
	// Send an explicit page_view event (not a repeat `config` — GA4 doesn't
	// reliably emit a hit from that). page_location carries the full URL incl.
	// utm_* params, which is where GA4 reads campaign/source attribution from;
	// page_path alone (query-stripped) would lose them.
	gtag("event", "page_view", {
		page_path: url,
		page_location: window.location.href,
		page_title: document.title,
	});
}

export function event(name: string, params?: GtagParams): void {
	gtag("event", name, params ?? {});
}
