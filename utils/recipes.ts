// Recipes behind the "View Recipe" panels on /aboutme/passion. Keyed by slug
// so the panel open/checked-off state in PassionComponent survives the
// category filter unmounting whole sections.

export interface IngredientGroup {
	/** Omit for single-list recipes; shown as a small heading otherwise. */
	group?: string;
	items: string[];
}

export interface Recipe {
	slug: string;
	name: string;
	/** Reused for the dish card image and the Recipe JSON-LD. */
	image: string;
	prepMinutes: number;
	cookMinutes: number;
	/** Extra timing the minutes can't express, e.g. an overnight marinade. */
	prepNote?: string;
	serves: number;
	difficulty: "Easy" | "Medium" | "Hard";
	ingredients: IngredientGroup[];
	steps: string[];
	tip?: string;
}

export const formatMinutes = (minutes: number): string => {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	if (!hours) return `${rest} min`;
	if (!rest) return `${hours} hr`;
	return `${hours} hr ${rest} min`;
};

/** Schema.org wants ISO 8601 durations, not "1 hr 15 min". */
export const isoDuration = (minutes: number): string => {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return `PT${hours ? `${hours}H` : ""}${rest ? `${rest}M` : ""}` || "PT0M";
};

export const flattenIngredients = (recipe: Recipe): string[] =>
	recipe.ingredients.reduce<string[]>((all, group) => all.concat(group.items), []);

export const RECIPES: Record<string, Recipe> = {
	"xa-xiu": {
		slug: "xa-xiu",
		name: "Xa Xiu Noodles",
		image: "/about/passion/xaxiu.webp",
		prepMinutes: 30,
		cookMinutes: 75,
		prepNote: "plus an overnight marinade",
		serves: 4,
		difficulty: "Medium",
		ingredients: [
			{
				group: "Char siu pork",
				items: [
					"2 lb pork shoulder, cut into long 2-inch-thick strips",
					"3 tbsp honey",
					"3 tbsp soy sauce",
					"2 tbsp hoisin sauce",
					"1 tbsp oyster sauce",
					"1 tbsp Shaoxing wine",
					"3 cloves garlic, minced",
					"1 tsp five-spice powder",
					"1 tsp red fermented bean curd, for color",
				],
			},
			{
				group: "Broth",
				items: [
					"2 lb pork bones",
					"1 yellow onion, halved and charred",
					"2-inch piece ginger, charred",
					"2 dried shiitake mushrooms",
					"1 tbsp rock sugar",
					"Fish sauce, to taste",
				],
			},
			{
				group: "The bowl",
				items: [
					"1 lb fresh egg noodles",
					"12 quail eggs",
					"12 shrimp and pork dumplings",
					"1 bunch baby bok choy",
					"Scallions, cilantro and fried shallots to finish",
				],
			},
		],
		steps: [
			"Whisk the marinade together, coat the pork strips and refrigerate overnight — four hours minimum, but overnight is what gets the color all the way through.",
			"Char the onion and ginger directly over a flame until blackened, then simmer with the bones and shiitake in 3 quarts of water for an hour, skimming the scum off the top. Season with rock sugar and fish sauce.",
			"Roast the pork at 400°F for 25 minutes, flipping and basting with the reserved marinade every 10 minutes until it lacquers. Rest 10 minutes, then slice thin against the grain.",
			"Boil the quail eggs for 4 minutes, shock them in ice water and peel.",
			"Blanch the bok choy for 30 seconds. Cook the noodles for 45 seconds — just until springy — then rinse and shake bone dry.",
			"Steam or poach the dumplings until they float and the wrappers turn translucent.",
			"Build each bowl: noodles first, pork fanned across the top, dumplings and quail eggs tucked around the edge, bok choy on the side. Broth goes in a separate bowl. Finish with scallions, cilantro and fried shallots.",
		],
		tip: "Baste in layers rather than pouring the marinade over at the end. Each coat caramelizes onto the last, and that's the whole difference between glazed and merely sauced.",
	},

	ribeye: {
		slug: "ribeye",
		name: "Dry-Aged Ribeye with Garlic Herb Butter",
		image: "/about/passion/steak2.webp",
		prepMinutes: 45,
		cookMinutes: 12,
		prepNote: "mostly tempering time",
		serves: 2,
		difficulty: "Medium",
		ingredients: [
			{
				items: [
					"1 dry-aged bone-in ribeye, 1.5 inches thick (about 1.25 lb)",
					"Kosher salt and coarsely cracked black pepper",
					"1 tbsp neutral high-smoke-point oil",
					"3 tbsp unsalted butter",
					"4 sprigs rosemary",
					"4 sprigs thyme",
					"1 head garlic, halved crosswise",
				],
			},
		],
		steps: [
			"Pat the steak bone dry, salt it generously on every surface and let it sit uncovered on a rack for 45 minutes at room temperature.",
			"Heat a cast iron pan over high heat until the oil shimmers and just begins to smoke.",
			"Lay the steak down away from you and leave it alone for 3 minutes. Flip once and sear 2 minutes on the second side.",
			"Hold the steak on its edge with tongs and render the fat cap for a full minute, until it crackles and browns.",
			"Drop to medium heat, add the butter, herbs and garlic, then tilt the pan and spoon the foaming butter over the steak continuously for 90 seconds.",
			"Pull it at 125°F internal for medium-rare — carryover heat takes it up another five degrees while it rests.",
			"Rest on a rack for 10 minutes, slice against the grain and spoon the pan butter back over the slices.",
		],
		tip: "A dry surface sears and a wet one steams. That uncovered rest in the fridge is doing more work than anything you do in the pan.",
	},

	"lamb-rack": {
		slug: "lamb-rack",
		name: "Herb-Crusted Rack of Lamb",
		image: "/about/passion/steak3.webp",
		prepMinutes: 20,
		cookMinutes: 25,
		serves: 3,
		difficulty: "Hard",
		ingredients: [
			{
				items: [
					"1 frenched rack of lamb, 8 ribs",
					"Kosher salt and black pepper",
					"1 tbsp Dijon mustard",
					"2 tbsp butter, for basting",
				],
			},
			{
				group: "Herb crust",
				items: [
					"1/2 cup panko breadcrumbs",
					"2 tbsp rosemary, finely chopped",
					"2 tbsp thyme leaves, finely chopped",
					"2 cloves garlic, minced",
					"2 tbsp olive oil",
					"Zest of 1 lemon",
				],
			},
		],
		steps: [
			"Bring the lamb to room temperature for 30 minutes. Score the fat cap in a shallow crosshatch and season hard on all sides.",
			"Toast the panko in olive oil until evenly golden, then pull it off the heat and stir in the rosemary, thyme, garlic and lemon zest.",
			"Start the rack fat side down in a cold pan and bring it up to medium-high. Four minutes gets you a deep brown cap; give the meat side one more.",
			"Brush the hot fat cap with Dijon and press the herb crust into it firmly.",
			"Roast at 400°F for 15 to 18 minutes, until a thermometer in the center of the eye reads 130°F.",
			"Tent and rest for 10 minutes before cutting down between the bones.",
		],
		tip: "Starting the fat cap in a cold pan lets it render before it browns. Drop it into a screaming hot pan instead and you get scorched outside, raw fat underneath.",
	},

	bolognese: {
		slug: "bolognese",
		name: "Spaghetti Bolognese",
		image: "/about/passion/sphagheti1.webp",
		prepMinutes: 20,
		cookMinutes: 180,
		serves: 6,
		difficulty: "Easy",
		ingredients: [
			{
				group: "Soffritto",
				items: [
					"1 yellow onion, finely diced",
					"1 carrot, finely diced",
					"1 celery rib, finely diced",
					"3 cloves garlic, minced",
					"2 tbsp olive oil",
				],
			},
			{
				group: "Sauce",
				items: [
					"1 lb ground beef chuck",
					"1/2 lb ground pork",
					"1 cup whole milk",
					"1 cup dry red wine",
					"1 28-oz can San Marzano tomatoes, crushed by hand",
					"2 tbsp tomato paste",
					"1 bay leaf",
					"A pinch of freshly grated nutmeg",
				],
			},
			{
				group: "To serve",
				items: [
					"1 lb spaghetti",
					"Parmigiano Reggiano, finely grated",
					"Flat-leaf parsley, chopped",
				],
			},
		],
		steps: [
			"Sweat the soffritto in olive oil over low heat for 12 minutes until it goes sweet and translucent. You want no color at all here.",
			"Raise the heat, add both meats and break them up. Let them actually brown rather than steam — work in batches if the pan is crowded.",
			"Pour in the milk and simmer until it has almost entirely cooked away.",
			"Add the wine and cook off the alcohol, then the tomatoes, tomato paste, bay leaf and nutmeg.",
			"Hold it at a bare simmer, uncovered, for two and a half to three hours. Stir now and then, and add a splash of water whenever it tightens up too much.",
			"Cook the spaghetti a minute shy of al dente and finish it in the sauce with a ladle of pasta water.",
			"Off the heat, fold in grated Parmigiano and scatter parsley over the top.",
		],
		tip: "The milk step reads wrong and tastes right. It's what keeps the meat tender instead of grainy after three hours of simmering.",
	},

	tonno: {
		slug: "tonno",
		name: "Spaghetti con il Tonno",
		image: "/about/passion/sphagheti2.webp",
		prepMinutes: 10,
		cookMinutes: 15,
		serves: 2,
		difficulty: "Easy",
		ingredients: [
			{
				items: [
					"7 oz good oil-packed tuna, drained with the oil reserved",
					"1/2 lb spaghetti",
					"4 cloves garlic, thinly sliced",
					"3 tbsp olive oil",
					"A pinch of red pepper flakes",
					"1/2 cup cherry tomatoes, halved",
					"Zest and juice of half a lemon",
					"A handful of flat-leaf parsley, chopped",
				],
			},
		],
		steps: [
			"Salt the pasta water heavily and start the spaghetti.",
			"Warm the olive oil and the reserved tuna oil with the sliced garlic over low heat until barely golden. Pull it before it browns — burnt garlic ruins the whole dish.",
			"Add the chilli flakes and tomatoes and cook for 3 minutes, until the tomatoes slump.",
			"Flake in the tuna in large pieces and warm it through. Resist stirring it into paste.",
			"Drag the pasta over a minute early along with a cup of its water, then toss hard over the heat until the sauce clings.",
			"Off the heat, finish with lemon zest, lemon juice and parsley.",
		],
		tip: "No cheese on this one. The tuna and lemon are carrying the dish, and Parmigiano flattens both.",
	},

	carbonara: {
		slug: "carbonara",
		name: "Seafood Carbonara",
		image: "/about/passion/carbo.webp",
		prepMinutes: 15,
		cookMinutes: 20,
		serves: 4,
		difficulty: "Medium",
		ingredients: [
			{
				group: "Sauce",
				items: [
					"4 egg yolks plus 1 whole egg",
					"1 cup Parmigiano Reggiano, finely grated",
					"Coarsely cracked black pepper, more than feels reasonable",
				],
			},
			{
				group: "Everything else",
				items: [
					"12 oz spaghetti or linguine",
					"1/2 lb shrimp, peeled and deveined",
					"1/2 lb lump crab meat, or lobster if you're feeling indulgent",
					"2 tbsp butter",
					"1 tbsp olive oil",
					"2 cloves garlic, crushed",
					"1 bunch asparagus, trimmed",
				],
			},
		],
		steps: [
			"Whisk the yolks, whole egg, Parmigiano and black pepper into a thick paste and set it aside.",
			"Pan-sear the asparagus in olive oil until blistered in spots, then set aside.",
			"Melt the butter with the garlic and sear the shrimp 90 seconds a side, until just opaque. Pull them before they curl tight, then fold the crab in off the heat.",
			"Cook the pasta to al dente and reserve a generous cup and a half of the water.",
			"Take the pan off the burner. Temper the egg mixture with a ladle of pasta water, then add the pasta and toss constantly — the burner stays off.",
			"Loosen with pasta water a splash at a time until the sauce is glossy rather than clumpy, then fold the seafood and asparagus back in.",
		],
		tip: "The pan has to be off the heat before the egg goes anywhere near it. Residual warmth cooks the sauce into silk; a live burner turns it into scrambled eggs.",
	},
};

export const RECIPE_LIST: Recipe[] = Object.keys(RECIPES).map(
	(slug) => RECIPES[slug]
);
