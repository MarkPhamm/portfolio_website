# Version History

| Version | Date | Changes |
|---------|------|---------|
| v3.2.5 | 2026-04-26 | Fix hero LCP: drop `opacity:0.05` gate so headline paints in HTML, code-split decorative hero SVG via `next/dynamic({ssr:false})`, dynamic-import Firebase view counter, reduce aurora blob count (4→3) and blur radii (~40%) for cheaper GPU paint |
| v3.2.4 | 2026-04-26 | Add `public/robots.txt` and `public/sitemap.xml` so Googlebot and other crawlers stop hitting 500s on these paths; sitemap covers `/`, `/aboutme/passion`, `/aboutme/startup` |
| v3.2.3 | 2026-04-26 | Harden .gitignore by adding bare `.env` alongside existing `.env.*.local` entries, preventing accidental commit of local secrets |
| v3.2.2 | 2026-04-25 | Simplify hero: remove "Hello/I'm", name-only headline at larger size, keep visitor count inline |
| v3.2.1 | 2026-04-25 | Convert ~60 images to WebP (20MB → 5.6MB), fix LCP loading priority, add version label to header |
| v3.2.0 | 2026-04-20 | Redesign OG preview card as editorial magazine cover, set minhbpham.com as canonical URL, update resume |
| v3.1.0 | 2026-04-15 | Integrate GA4 + Microsoft Clarity analytics, add Docker/Networking projects, clickthrough GitHub/Wakatime metrics |
| v3.0.0 | 2026-03-24 | Redesign Articles section with featured card layout, Substack cards, rework skill icons with tooltips, scroll-reveal animations, responsive overhaul, 10ms transitions site-wide |
| v2.1.0 | 2026-01-15 | Redesign timeline with gradient overlays, testimonial carousel, purple scrollbar/progress bar/text selection, improve project modal UX |
| v2.0.0 | 2025-12-01 | Aurora hero background, new project tiles with tech stack icons, project modal, Passion/Startup subpages, Firebase view counting |
| v1.0.0 | 2025-07-12 | Initial launch — homepage with hero, skills, projects, timeline, comments. Next.js 12 + Tailwind + GSAP |
