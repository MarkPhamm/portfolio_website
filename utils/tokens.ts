// Hex mirrors of the CSS design tokens in styles/globals.scss, for consumers
// that can't read `var()` reliably: SVG presentation attributes, WebGL
// uniforms, third-party image URLs (ghchart).
export const TOKENS = {
	canvas: "#060507",
	surface1: "#0c0b10",
	surface2: "#131218",
	surface3: "#1b1a21",
	ink1: "#f5f4f7",
	ink2: "#a3a1ad",
	ink3: "#807e8a",
	ink4: "#6a6873",
	violet: "#9146ff",
	violetSoft: "#bf94ff",
	line: "rgba(255, 255, 255, 0.08)",
	lineStrong: "rgba(255, 255, 255, 0.16)",
} as const;
