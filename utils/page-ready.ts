// "The page is on screen now" signal. Entrances (header, hero) wait on it so
// they play as the intro letterbox opens or the route curtain lifts — not
// underneath them. Sources: the first-visit intro, the route curtain, or a
// direct landing (_app). A failsafe guarantees nothing stays hidden.
export type ReadySource = "intro" | "curtain" | "direct";

let ready = false;
let source: ReadySource | null = null;
const listeners = new Set<() => void>();

export const isPageReady = (): boolean => ready;

// Which event revealed the current page (entrances can tune their timing).
export const readySource = (): ReadySource | null => source;

export const whenPageReady = (cb: () => void, failsafeMs = 4000): (() => void) => {
	if (ready) {
		cb();
		return () => {};
	}
	let done = false;
	const run = () => {
		if (done) return;
		done = true;
		listeners.delete(run);
		clearTimeout(timer);
		cb();
	};
	const timer: ReturnType<typeof setTimeout> = setTimeout(run, failsafeMs);
	listeners.add(run);
	return () => {
		done = true;
		listeners.delete(run);
		clearTimeout(timer);
	};
};

export const markPageReady = (from: ReadySource): void => {
	ready = true;
	source = from;
	Array.from(listeners).forEach((fn) => fn());
	listeners.clear();
};

export const resetPageReady = (): void => {
	ready = false;
	source = null;
};
