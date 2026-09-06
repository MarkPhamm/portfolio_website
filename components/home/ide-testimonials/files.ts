import { COMMENTS } from "../../../constants";

// Each recommendation becomes a fake markdown "file" in the IDE window.
export interface ITestimonialFile {
	id: string; // "noah-pelberg"
	fileName: string; // "noah_pelberg.md"
	folder: string; // company: insurify | lazard | academia | mentees | mentors
	subfolder?: string; // Insurify relationship group: senior | peers | junior
	tag: string; // recomendationType: work | college | mentee
	displayName: string; // "Noah Pelberg"
	rawAuthor: string; // "Noah, Pelberg" — the COMMENTS/THEMES join key
	role: string;
	avatar: string;
	quoteLines: string[]; // one sentence per editor line
}

// Per-folder accent (material-icon-theme spirit): folder icons, file icons,
// and quick-open dots all pick up their company's color.
export const FOLDER_COLORS: Record<string, string> = {
	insurify: "#fb923c",
	lazard: "#38bdf8",
	academia: "#fbbf24",
	mentees: "#34d399",
	mentors: "#fb7185",
};

export const folderColor = (folder: string): string =>
	FOLDER_COLORS[folder] ?? "#BF94FF";

// "Noah, Pelberg" → ["noah", "pelberg"]
const nameParts = (author: string): string[] =>
	author
		.split(",")
		.map((part) => part.trim().toLowerCase().replace(/[^a-z0-9]/g, ""))
		.filter(Boolean);

// Sentence-per-line split (no regex lookbehind — old Safari throws at parse
// time, which would crash the whole chunk).
const toLines = (comment: string): string[] =>
	(comment.match(/[^.!?]+[.!?]*/g) || [comment]).map((s) => s.trim());

export const FILES: ITestimonialFile[] = COMMENTS.map((c) => {
	const parts = nameParts(c.author);
	const insurifyGroup: Record<string, string> = {
		"Aaron, Chen": "senior",
		"Noah, Pelberg": "peers",
		"Steven, Egnaczyk": "peers",
		"Max, Brinker": "peers",
		"Peter, Manto": "peers",
		"Derek, Le": "junior",
		"Yuki, Fang": "junior",
		"Ethan, Liu": "junior",
	};
	return {
		id: parts.join("-"),
		fileName: `${parts.join("_")}.md`,
		folder: c.company,
		subfolder: c.company === "insurify" ? insurifyGroup[c.author] : undefined,
		tag: c.recomendationType,
		displayName: c.author.replace(", ", " "),
		rawAuthor: c.author,
		role: c.position,
		avatar: c.avatar,
		quoteLines: toLines(c.comment),
	};
});

export interface ITestimonialFolder {
	name: string;
	files: ITestimonialFile[];
	children?: ITestimonialFolder[];
}

// Folders grouped by company, with Insurify recommendations split by working
// relationship. Other companies remain one level deep.
export const FOLDERS: ITestimonialFolder[] = FILES.reduce<ITestimonialFolder[]>(
	(folders, file) => {
		const existing = folders.find((f) => f.name === file.folder);
		if (existing) {
			if (file.folder !== "insurify") existing.files.push(file);
		} else if (file.folder === "insurify") {
			const groups = ["senior", "peers", "junior"].map((name) => ({
				name,
				files: FILES.filter((candidate) => candidate.subfolder === name),
			}));
			folders.push({ name: file.folder, files: [], children: groups });
		} else {
			folders.push({ name: file.folder, files: [file] });
		}
		return folders;
	},
	[]
);

// TESTIMONIAL_THEMES.authors keeps the raw "First, Last" strings — this lookup
// bridges them to files without touching the constants.ts contract.
export const FILE_BY_AUTHOR: Record<string, ITestimonialFile> = COMMENTS.reduce(
	(acc, c, i) => {
		acc[c.author] = FILES[i];
		return acc;
	},
	{} as Record<string, ITestimonialFile>
);
