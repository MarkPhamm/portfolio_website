import type { NextApiRequest, NextApiResponse } from "next";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WAKATIME_USER = "MarkPham";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (typeof id !== "string" || !UUID_RE.test(id)) {
		return res.status(400).json({ error: "Invalid id" });
	}

	try {
		const upstream = await fetch(
			`https://wakatime.com/share/@${WAKATIME_USER}/${id}.svg`,
			{ headers: { accept: "image/svg+xml" } }
		);

		if (!upstream.ok) {
			return res.status(upstream.status).end();
		}

		const svg = await upstream.text();
		const cacheControl =
			"public, s-maxage=86400, stale-while-revalidate=604800";

		res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
		res.setHeader("Cache-Control", cacheControl);
		res.setHeader("Netlify-CDN-Cache-Control", cacheControl);
		return res.status(200).send(svg);
	} catch {
		return res.status(502).json({ error: "Upstream fetch failed" });
	}
}
