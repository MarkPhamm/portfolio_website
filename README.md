# Mark Pham — Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Personal portfolio of **Minh (Mark) Pham**, Analytics Engineer — live at [minhbpham.com](https://minhbpham.com).

## Stack

- **Next.js 12** (pages router) + React 17 + TypeScript
- **Tailwind CSS** + SCSS globals
- **GSAP** (ScrollTrigger, MotionPath) for animation
- **Firebase Firestore** (visitor counter)
- Deployed on **Netlify** (auto-deploys from `main`)

## Highlights

- Animated analytics-pipeline DAG hero (sources → Airflow-orchestrated dbt DAG → Snowflake → dashboard)
- Custom magnetic cursor, scroll-driven section reveals, live GitHub stats
- Sub-pages: [Passion](https://minhbpham.com/aboutme/passion), [Start-up](https://minhbpham.com/aboutme/startup), [Reads](https://minhbpham.com/aboutme/reads)

## Local development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

All site content lives in `constants.ts`. Change history is tracked in [VERSION.md](./VERSION.md).

## Credits

Originally based on [folio](https://github.com/ayush013/folio) by Ayush Singh (MIT) — heavily reworked since; see [VERSION.md](./VERSION.md) for the full evolution. License in [LICENSE](./LICENSE).
