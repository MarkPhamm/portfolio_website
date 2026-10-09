// Navigation data, kept apart from constants.ts so the app-wide route
// curtain (_app chunk) can read page names without pulling in all the site
// data. constants.ts re-exports both for existing imports.
export const NAVBARITEMS = [
	{
		name: "Home",
		ref: "home",
	},
	{
		name: "Query Me",
		ref: "sql",
	},
	{
		name: "Testimonials",
		ref: "comments",
	},
	{
		name: "Skillset",
		ref: "skills",
	},
	{
		name: "Articles",
		ref: "articles",
	},
	{
		name: "Projects",
		ref: "works",
	},
	{
		name: "My Activity",
		ref: "activity",
	},
	{
		name: "Experience",
		ref: "timeline",
	},
	{
		name: "Passion",
		ref: "/aboutme/passion",
	},
	{
		name: "Start-up",
		ref: "/aboutme/startup",
	},
	{
		name: "Reads",
		ref: "/aboutme/reads",
	},
];

// NOTE: home sections read their DOM ids from this array BY INDEX
// (hero=0, skills=1, projects=3, timeline=4) — append new entries at the
// END, never insert in the middle, or every section id shifts.
export const MENULINKS = [
	{
		name: "Home",
		ref: "home",
	},
	{
		name: "Skillset",
		ref: "skills",
	},
	{
		name: "Articles",
		ref: "articles",
	},
	{
		name: "Projects",
		ref: "works",
	},
	{
		name: "Experience",
		ref: "timeline",
	},
	{
		name: "Query Me",
		ref: "sql",
	},
];
