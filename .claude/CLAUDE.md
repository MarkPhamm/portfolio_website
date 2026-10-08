# Portfolio Project Instructions

## Project Overview

- Next.js 12.1.5 portfolio, deployed on **Netlify** (`minhbphamportfolio.netlify.app`)
- Tailwind CSS + GSAP animations + SCSS globals + Firebase Firestore
- Repo: `HoanqDucAnh/portfolio`, branch `main` auto-deploys

## Key File Structure

- `constants.ts` — all data (TIMELINE, COMMENTS, MENULINKS, SOCIAL_LINKS, NAVBARITEMS, skills)
- `components/home/` — homepage sections (hero, skills, projects, timeline, comment, collaboration) + `silk-backdrop.tsx` / `silk-canvas.tsx` (the WebGL light field fixed behind the whole homepage)
- `components/common/` — shared (header, menu, footer, section-header, project-tile/modal) + the motion shell mounted in `_app` (transition-controller, smooth-scroll, film-fx, cursor-label)
- `pages/aboutme/` — passion + startup subpages (orange theme `#f27d0d`)
- `pages/myarticle/` — article pages (redirected to Substack via next.config.js)
- `styles/globals.scss` — design tokens (`:root` RGB triplets), type/surface utilities, scrollbar, progress bar, text selection
- `utils/motion.ts` (eases, `revealUp`, `clipReveal`), `utils/motion-text.ts` (SplitText/ScrambleText — import only from lazy sections, keeps them out of `_app`), `utils/scroll.ts` (Lenis-aware `scrollToTarget`, `lockScroll`), `utils/page-ready.ts` (entrances wait for intro/curtain)

## Critical Gotchas

- **Next.js 12.1.5**: `images.unoptimized` config requires 12.3+. Currently using `loader: 'akamai', path: '/'` for Netlify compatibility
- **Netlify**: No `/_next/image` API — images must resolve to static paths
- **TypeScript**: Use `ReturnType<typeof setTimeout>` not `NodeJS.Timeout` for timer types (CI compatibility)
- **Header hamburger menu**: Do NOT hide on desktop with `md:hidden` — mobile users need it and it breaks the mobile menu
- **ESLint**: Use `<Link>` wrapper for internal `<a>` tags (`@next/next/no-html-link-for-pages`)
- **Hero LCP**: the H1 must be painted at FULL opacity on the first frame (Chrome ignores a 0.05-opacity paint for LCP); its entrance is a blur/translate focus pull. Never mask/clip/fade it, and build hero scroll effects on the first scroll intent, never at load — pinning it once re-parented the H1 into a pin-spacer and re-timed the LCP paint (measured +1.5s)
- **Scrolling is native**: Lenis runs with `smoothWheel: false` — it only eases programmatic scrolls (route them through `utils/scroll.ts`) and locks scroll for overlays (`lockScroll()` + `data-lenis-prevent` on the menu/modal). Smoothed wheel scrolling felt slow; don't turn it back on
- **Homepage backdrop**: `silk-backdrop.tsx` is `fixed` at `z-0` under `<main class="relative z-[1]">`, so the light is constant behind every section. Keep homepage sections transparent — no opaque section backgrounds, and fade edges with `mask-image`, not canvas-coloured overlays (they show as dark bands)
- **Pins**: `<main>` is `flex flex-col`, where ScrollTrigger defaults `pinSpacing` to false — set it explicitly
- **Per-page CSS vars**: Next 12 never removes `<Head><style>` on client navigation (it leaks to the next page) — use `utils/use-page-accent.ts`
- **Hovers stay 10ms** (`duration-[10ms]`); motion goes into scroll/entrance/route choreography

## Brand Colors

- Obsidian canvas `#060507`, surfaces `surface-1/2/3`, text `ink-1..4` (`ink-4` is large/decorative text only — fails AA small), hairlines `line` / `line-strong`; `gray-*` is remapped to this ramp
- Purple is light, not paint: `violet` `#9146FF`, `violet-soft` `#BF94FF` for accents/glows/active states; shell components use `accent`/`accent-soft` (orange on Passion/Start-up)
- Startup/passion pages: orange `#f27d0d`
- Project card hover text: `text-violet-soft` (not yellow)
