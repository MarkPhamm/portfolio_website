import React, { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../../utils/motion";
import { whenPageReady } from "../../utils/page-ready";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Light filaments folding through a near-black field: two layered sine
// fields over a slowly domain-warped coordinate space give silk-like folds;
// a third slow noise fades them in and out along their length so no fold
// ever closes into a visible ring.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
		mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
		u.y
	);
}

float fbm(vec2 p) {
	float v = 0.0;
	float a = 0.5;
	mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
	for (int i = 0; i < 4; i++) {
		v += a * noise(p);
		p = m * p;
		a *= 0.5;
	}
	return v;
}

void main() {
	vec2 uv = gl_FragCoord.xy / uRes;
	vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
	float t = uTime * 0.06;

	vec2 w = vec2(
		fbm(p * 0.75 + vec2(t * 0.6, -t * 0.4)),
		fbm(p * 0.75 + vec2(-t * 0.5, t * 0.3) + 4.1)
	);
	vec2 q = p + (w - 0.5) * 1.6 + uMouse * 0.06;

	float field = sin(q.x * 2.1 + q.y * 1.2 + t * 1.4) * 0.62
		+ sin(-q.x * 1.0 + q.y * 2.6 - t * 1.1 + 2.4 * w.x) * 0.38;
	float fold = 1.0 - abs(field);
	float fold2 = 1.0 - abs(sin(q.x * 3.3 - q.y * 0.9 + t * 0.9 + 3.1 * w.y));
	float breakup = mix(0.3, 1.0, smoothstep(0.25, 0.75, fbm(p * 0.6 + vec2(t * 0.3, -t * 0.2) + 9.0)));

	vec3 col = mix(vec3(0.024, 0.020, 0.034), vec3(0.085, 0.040, 0.185), smoothstep(-0.7, 0.9, field));
	col += vec3(0.569, 0.275, 1.0) * pow(fold, 3.2) * 0.38 * breakup;
	col += vec3(0.92, 0.88, 1.0) * pow(fold, 10.0) * 0.75 * breakup;
	col += vec3(0.749, 0.580, 1.0) * pow(fold2, 12.0) * 0.22 * breakup;

	// Light pools top-right and bottom-left; the centre (the name) stays calm.
	float pool = smoothstep(1.35, 0.0, length(p - vec2(0.55, 0.32)));
	float pool2 = smoothstep(1.1, 0.0, length(p - vec2(-0.75, -0.45)));
	col *= 0.34 + 0.8 * pool + 0.36 * pool2;
	col *= mix(0.58, 1.0, smoothstep(0.0, 0.62, length(p * vec2(0.9, 1.4))));

	// Vignette.
	col *= mix(0.35, 1.0, smoothstep(1.35, 0.25, length((uv - 0.5) * vec2(1.15, 1.0))));

	// Dither so the dark gradients don't band.
	col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
	gl_FragColor = vec4(col, 1.0);
}
`;

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
};

/**
 * The homepage's light field: one full-screen triangle on the fixed backdrop,
 * rendered at half resolution (the field is soft anyway) and faded in over
 * the static CSS gradient once ready. Booted after the entrance so it never
 * competes with the hero paint or intro. It holds still while the page is
 * scrolling — the compositor gets the GPU to itself, and the field's clock
 * pauses too, so it resumes exactly where it stopped — and stops when the tab
 * is hidden or WebGL is lost. Reduced motion renders a single still frame.
 */
const SilkCanvas = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let disposed = false;
		let raf = 0;
		let cleanupGl = () => {};

		const boot = () => {
			if (disposed) return;
			const gl = canvas.getContext("webgl", {
				alpha: false,
				antialias: false,
				depth: false,
				stencil: false,
				powerPreference: "low-power",
			}) as WebGLRenderingContext | null;
			if (!gl) return;

			const vs = compile(gl, gl.VERTEX_SHADER, VERT);
			const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
			const program = gl.createProgram();
			if (!vs || !fs || !program) return;
			gl.attachShader(program, vs);
			gl.attachShader(program, fs);
			gl.linkProgram(program);
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
			gl.useProgram(program);

			const buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
			const aPos = gl.getAttribLocation(program, "aPos");
			gl.enableVertexAttribArray(aPos);
			gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

			const uRes = gl.getUniformLocation(program, "uRes");
			const uTime = gl.getUniformLocation(program, "uTime");
			const uMouse = gl.getUniformLocation(program, "uMouse");

			const touch = window.matchMedia("(hover: none)").matches;
			const scale = Math.min(window.devicePixelRatio || 1, 1.5) * (touch ? 0.4 : 0.5);
			const resize = () => {
				const w = Math.max(1, Math.round(canvas.clientWidth * scale));
				const h = Math.max(1, Math.round(canvas.clientHeight * scale));
				if (canvas.width !== w || canvas.height !== h) {
					canvas.width = w;
					canvas.height = h;
					gl.viewport(0, 0, w, h);
				}
				gl.uniform2f(uRes, w, h);
			};

			const target = { x: 0, y: 0 };
			const mouse = { x: 0, y: 0 };
			const onMove = (e: PointerEvent) => {
				target.x = (e.clientX / window.innerWidth - 0.5) * 2;
				target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
			};

			// The field's own clock (seconds): it only advances on drawn frames,
			// so pausing never makes it jump on resume.
			let clock = 18;
			// ~30fps: the field drifts slowly enough that nobody can tell.
			const minFrameMs = 32;
			let prev = 0;
			let scrolling = false;
			let settle: ReturnType<typeof setTimeout> | undefined;

			const draw = () => {
				mouse.x += (target.x - mouse.x) * 0.035;
				mouse.y += (target.y - mouse.y) * 0.035;
				gl.uniform1f(uTime, clock);
				gl.uniform2f(uMouse, mouse.x, mouse.y);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
			};
			const frame = (now: number) => {
				raf = 0;
				if (disposed || scrolling || document.hidden) {
					prev = 0;
					return;
				}
				if (!prev) {
					prev = now;
				} else if (now - prev >= minFrameMs) {
					clock += Math.min(now - prev, 100) / 1000;
					prev = now;
					draw();
				}
				raf = requestAnimationFrame(frame);
			};
			const reduce = prefersReducedMotion();
			const kick = () => {
				if (!raf && !disposed && !reduce && !scrolling && !document.hidden) {
					raf = requestAnimationFrame(frame);
				}
			};
			const onScroll = () => {
				scrolling = true;
				if (settle) clearTimeout(settle);
				settle = setTimeout(() => {
					scrolling = false;
					kick();
				}, 180);
			};

			resize();
			draw();
			canvas.style.opacity = "1";
			kick();

			const onResize = () => {
				resize();
				draw();
			};
			const onLost = (e: Event) => {
				e.preventDefault();
				disposed = true;
				canvas.style.opacity = "0";
			};
			window.addEventListener("resize", onResize);
			window.addEventListener("pointermove", onMove, { passive: true });
			if (!reduce) window.addEventListener("scroll", onScroll, { passive: true });
			document.addEventListener("visibilitychange", kick);
			canvas.addEventListener("webglcontextlost", onLost);
			cleanupGl = () => {
				if (settle) clearTimeout(settle);
				window.removeEventListener("resize", onResize);
				window.removeEventListener("pointermove", onMove);
				window.removeEventListener("scroll", onScroll);
				document.removeEventListener("visibilitychange", kick);
				canvas.removeEventListener("webglcontextlost", onLost);
				gl.getExtension("WEBGL_lose_context")?.loseContext();
			};
		};

		// Shader compilation can block the main thread (badly on weak GPUs), so
		// boot only after the intro/entrance choreography has played out; the
		// static gradient covers until then and the canvas fades in over it.
		type IdleWindow = Window & {
			requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
			cancelIdleCallback?: (id: number) => void;
		};
		const w = window as IdleWindow;
		let idleId: number | undefined;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const cancelReady = whenPageReady(() => {
			timer = setTimeout(() => {
				if (w.requestIdleCallback) idleId = w.requestIdleCallback(boot, { timeout: 1500 });
				else boot();
			}, 1800);
		});

		return () => {
			disposed = true;
			cancelReady();
			if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
			if (timer) clearTimeout(timer);
			if (raf) cancelAnimationFrame(raf);
			cleanupGl();
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className="absolute inset-0 h-full w-full"
			style={{ opacity: 0, transition: "opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
		/>
	);
};

export default SilkCanvas;
