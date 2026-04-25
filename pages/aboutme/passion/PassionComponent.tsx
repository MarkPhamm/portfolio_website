import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import Typed from "typed.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.15 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-[0.97]"} ${className}`}
			style={{ transitionDelay: `${delay}ms` }}
		>
			{children}
		</div>
	);
};

interface DishCardProps {
	image: string;
	title: string;
	subtitle?: string;
	caption: string;
	description: React.ReactNode;
	reverse?: boolean;
}

const DishCard = ({ image, title, subtitle, caption, description, reverse = false }: DishCardProps) => (
	<div className={`grid grid-cols-1 lg:grid-cols-2 gap-6`}>
		<ScrollReveal delay={0} className={`group ${reverse ? 'lg:order-2' : ''}`}>
			<div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[4/3]">
				<Image
					src={image}
					layout="fill"
					objectFit="cover"
					loading="lazy"
					alt={title}
					className="transition-transform duration-500 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
			</div>
			<p className="text-sm text-gray-400 italic text-center mt-3">{caption}</p>
		</ScrollReveal>
		<ScrollReveal delay={200} className={`${reverse ? 'lg:order-1' : ''}`}>
			{subtitle && (
				<span className="inline-block px-3 py-1 bg-[#f27d0d]/20 text-[#f27d0d] text-sm font-medium rounded-full mb-3">
					{subtitle}
				</span>
			)}
			<h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h3>
			<div className="text-gray-300 text-lg md:text-xl leading-relaxed space-y-4">
				{description}
			</div>
		</ScrollReveal>
	</div>
);

interface CategoryTabProps {
	categories: string[];
	activeCategory: string;
	onSelect: (category: string) => void;
}

const CategoryTabs = ({ categories, activeCategory, onSelect }: CategoryTabProps) => (
	<div className="flex flex-wrap justify-center gap-3 mb-12">
		{categories.map((category) => (
			<button
				key={category}
				onClick={() => onSelect(category)}
				className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
					activeCategory === category
						? 'bg-[#f27d0d] text-white shadow-lg shadow-[#f27d0d]/30 scale-105'
						: 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105'
				}`}
			>
				{category}
			</button>
		))}
	</div>
);

const PASSION_TYPED_STRINGS = [
	'The joy is in cooking for <span style="color:#f27d0d">others</span>',
	'Every dish tells a <span style="color:#f27d0d">story</span>',
	'Patience, precision, <span style="color:#f27d0d">passion</span>',
];

const PassionHero = () => {
	const typedRef = useRef<HTMLSpanElement>(null);
	const heroRef = useRef<HTMLDivElement>(null);
	const bgRef = useRef<HTMLDivElement>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setLoaded(true), 100);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!bgRef.current || !heroRef.current) return;
		gsap.registerPlugin(ScrollTrigger);
		const tween = gsap.to(bgRef.current, {
			yPercent: 30,
			ease: "none",
			scrollTrigger: {
				trigger: heroRef.current,
				start: "top top",
				end: "bottom top",
				scrub: true,
			},
		});
		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
		};
	}, []);

	useEffect(() => {
		if (!typedRef.current) return;
		const typed = new Typed(typedRef.current, {
			strings: PASSION_TYPED_STRINGS,
			typeSpeed: 40,
			backSpeed: 25,
			backDelay: 4000,
			contentType: 'html',
			loop: true,
		});
		return () => typed.destroy();
	}, []);

	return (
		<div ref={heroRef} className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900 z-10" />
			<div ref={bgRef} className="absolute inset-0 will-change-transform">
				<Image
					src="/about/passion/steak3.webp"
					layout="fill"
					objectFit="cover"
					alt="Culinary background"
					priority
				/>
			</div>
			<div className={`relative z-20 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
				<p className={`text-[#f27d0d] text-lg md:text-xl font-medium tracking-[0.25em] uppercase mb-6 transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
					Beyond the Code
				</p>
				<h1 className={`text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-10 transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
					My Passion for <span className="text-[#f27d0d]">Cuisine</span>
				</h1>
				<div className={`text-xl md:text-2xl text-gray-200/90 italic max-w-3xl mx-auto min-h-[1.5em] transition-all duration-1000 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
					<span ref={typedRef}></span>
				</div>
			</div>
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent z-10" />
		</div>
	);
};

const AnimatedLine = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.5 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className="flex justify-center mt-4">
			<div
				className={`h-1 bg-gradient-to-r from-[#f27d0d] to-[#ff9a3c] rounded-full transition-all duration-700 ease-out ${isVisible ? "w-20" : "w-0"}`}
			/>
		</div>
	);
};

const SectionDivider = ({ title, subtitle }: { title: string; subtitle?: string }) => (
	<ScrollReveal>
		<div className="text-center mb-8">
			{subtitle && (
				<span className="text-[#f27d0d] text-sm font-medium tracking-wider uppercase">{subtitle}</span>
			)}
			<h2 className="text-3xl md:text-5xl font-bold text-white mt-2">
				{title}
			</h2>
			<AnimatedLine />
		</div>
	</ScrollReveal>
);

export default function PassionComponent() {
	const [activeCategory, setActiveCategory] = useState("All");
	const [contentVisible, setContentVisible] = useState(true);
	const categories = ["All", "Family", "Steak & Lamb", "Seafood", "Italian"];

	const shouldShow = (category: string) => activeCategory === "All" || activeCategory === category;

	const handleCategoryChange = (category: string) => {
		if (category === activeCategory) return;
		setContentVisible(false);
		setTimeout(() => {
			setActiveCategory(category);
			setContentVisible(true);
		}, 250);
	};

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<PassionHero />

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				{/* Category Navigation */}
				<CategoryTabs
					categories={categories}
					activeCategory={activeCategory}
					onSelect={handleCategoryChange}
				/>

				<div className={`transition-all duration-300 ease-out ${contentVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.97] translate-y-4"}`}>
				{/* Family Dish Section */}
				{shouldShow("Family") && (
					<section className="mb-20">
						<SectionDivider title="Family Dish" subtitle="Heritage Recipe" />
						<DishCard
							image="/about/passion/xaxiu.webp"
							title="Xa Xiu Noodles"
							subtitle="A Special Dish for Family Celebrations"
							caption="Xa Xiu Noodles with Char Siu Pork, Dumplings, Shrimp and Quail Eggs"
							description={
								<>
									<p>
										One of my favorite dishes to prepare at family gatherings and
										anniversaries is <strong className="text-[#f27d0d]">Xa Xiu noodles</strong>. This traditional
										Vietnamese dish, made with egg noodles, tender char siu pork, and
										quail eggs, embodies a world of nostalgic flavors.
									</p>
									<p>
										The recipe has been passed down through generations in my family.
										Every step - from slow-braising the pork in a caramelized soy glaze
										to carefully boiling the quail eggs - carries a story. I learned it
										by watching my grandmother, who cooked by instinct rather than
										measurements.
									</p>
								</>
							}
						/>
					</section>
				)}

				{/* Steak Section */}
				{shouldShow("Steak & Lamb") && (
					<section className="mb-20">
						<SectionDivider title="Steak & Lamb" subtitle="Signature Dishes" />

						<DishCard
							image="/about/passion/steak2.webp"
							title="Dry-Aged Ribeye"
							subtitle="Rosemary, Thyme & Garlic Butter"
							caption="Dry-Aged Ribeye with Rosemary, Thyme and Garlic Butter"
							description={
								<>
									<p>
										My journey with steak started humbly - a bit comically even. My early
										attempts were, let's say, less than perfect. As Mom described, they
										were burnt, under-seasoned, and rubbery.
									</p>
									<p>
										<em>"Tenaciously"</em>, I threw myself into mastering the art of cooking
										steak. After countless attempts, testing every little detail: the pan
										temperature, the timing, the seasoning, basting it with butter and
										fresh herbs, I finally nailed it: a perfectly seared, medium-rare,
										dry-aged ribeye, basted in rosemary-thyme butter that was tender,
										juicy, and packed with flavor.
									</p>
									</>
							}
							reverse
						/>

						<div className="mt-16">
							<DishCard
								image="/about/passion/steak3.webp"
								title="Seared Lamb Rack"
								subtitle="The Next Challenge"
								caption="Seared Lamb Rack with Rosemary, Thyme and Garlic Butter"
								description={
									<>
										<p>
											After mastering steak, I felt ready to take on an even more
											challenging ingredient - a rack of lamb. Cooking lamb requires a higher level of precision and care, from the
											seasoning to the sear to ensuring it's cooked to the perfect level of
											doneness.
										</p>
										<blockquote className="border-l-4 border-[#f27d0d] pl-4 italic text-gray-400 my-4">
											"The greater the payoff, the greater the hardship." — Alex Hormozi
										</blockquote>
										<p>
											Despite the added complexity, achieving that delicate, tender meat
											with a crispy herb-crusted exterior was incredibly rewarding to me.
										</p>
									</>
								}
							/>
						</div>
					</section>
				)}

				{/* Seafood Section */}
				{shouldShow("Seafood") && (
					<section className="mb-20">
						<SectionDivider title="Seafood Sensations" subtitle="Ocean Flavors" />

						{/* Seafood Gallery Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
							{[
								{
									image: "/about/passion/seafood1.webp",
									title: "Pan-Seared Salmon",
									caption: "With mushrooms and asparagus spears"
								},
								{
									image: "/about/passion/seafood2.webp",
									title: "Herb-Crusted Salmon",
									caption: "With rice, sunny egg, and sautéed veggies"
								},
								{
									image: "/about/passion/seafood3.webp",
									title: "Crispy Skin Salmon",
									caption: "With asparagus and garlic chips"
								}
							].map((item, index) => (
								<ScrollReveal key={index} delay={index * 150}>
									<div className="group relative overflow-hidden rounded-2xl bg-gray-800 cursor-pointer">
										<div className="aspect-[4/3] overflow-hidden">
											<Image
												src={item.image}
												width={400}
												height={300}
												loading="lazy"
												alt={item.title}
												className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
											/>
										</div>
										<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
										<div className="absolute bottom-0 left-0 right-0 p-5">
											<h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
											<p className="text-sm text-gray-300">{item.caption}</p>
										</div>
									</div>
								</ScrollReveal>
							))}
						</div>

						<ScrollReveal>
					<div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
							<h3 className="text-2xl font-bold text-white mb-4">The Art of Seafood</h3>
							<div className="text-gray-300 text-lg md:text-xl leading-relaxed space-y-4">
								<p>
									Simple but delicious, these dishes are all about bringing out the natural
									flavors. Starting with a salmon fillet, I sear it just right to get
									a crispy, golden crust while keeping the inside nice and juicy. Then,
									I pile on some mushrooms sautéed in garlic—those mushrooms soak up all
									the flavor and add a nice, rich taste to the dish.
								</p>
								<p>
									The salmon's skin is seared to golden perfection, adding a satisfying crunch that
									contrasts beautifully with the tender, flaky flesh beneath. Paired
									with freshly roasted asparagus spears and topped with crisp garlic
									chips, this dish is a celebration of simplicity and sophistication.
								</p>
							</div>
						</div>
					</ScrollReveal>
					</section>
				)}

				{/* Italian Section */}
				{shouldShow("Italian") && (
					<section className="mb-20">
						<SectionDivider title="Italian Cuisine" subtitle="Pasta Perfection" />

						<ScrollReveal>
					<div className="bg-gradient-to-r from-[#f27d0d]/10 to-transparent rounded-2xl p-8 mb-12 border-l-4 border-[#f27d0d]">
							<p className="text-lg text-gray-300 leading-relaxed">
								Italian cuisine has always held a special place in my heart. The
								simplicity, yet depth of flavor in Italian cooking is like an endless
								canvas of possibilities that never fails to excite me. From rich,
								hearty sauces to delicate pasta dishes, Italy has a cuisine that
								celebrates fresh ingredients, thoughtful preparation, and bold
								flavors—a combination that keeps me coming back for more.
							</p>
						</div>
					</ScrollReveal>

						<div className="space-y-16">
							<DishCard
								image="/about/passion/sphagheti1.webp"
								title="Spaghetti Bolognese"
								subtitle="The Classic"
								caption="Spaghetti Bolognese with a sprinkle of fresh parsley"
								description={
									<p>
										Spaghetti Bolognese is one of those dishes that I find myself
										returning to time and time again. There's something incredibly
										comforting about a bowl of al dente spaghetti topped with a rich,
										savory Bolognese sauce. I make mine with tender minced meat, slowly
										simmered in a tomato-based sauce and hints of garlic, onion, and
										herbs. The flavors meld beautifully, creating a symphony of richness
										and family warmth.
									</p>
								}
								reverse
							/>

							<DishCard
								image="/about/passion/sphagheti2.webp"
								title="Spaghetti con il Tonno"
								subtitle="Simple Elegance"
								caption="Spaghetti con il Tonno - Tuna Pasta"
								description={
									<p>
										Another Italian favorite of mine is Spaghetti con il Tonno. Such a
										beauty of simplicity. Al dente spaghetti is tossed with tender tuna
										flakes, sautéed garlic, a splash of olive oil, and a sprinkle of fresh
										parsley. The result is light yet satisfying, a dish that's as
										comforting as it is flavorful. It reminds me of
										the versatility of Italian cuisine—how just a handful of quality
										ingredients can create something memorable.
									</p>
								}
							/>

							<DishCard
								image="/about/passion/carbo.webp"
								title="Seafood Carbonara"
								subtitle="Ocean-Inspired Fusion"
								caption="Seafood Carbonara with pan-seared asparagus"
								description={
									<p>
										Seafood Carbonara has become one of my go-to dishes when I want to
										serve something special. It's a rich, ocean-inspired spin on classic
										carbonara. Instead of the usual pancetta, I like to use fresh
										seafood—plump shrimp, sweet crab, or, if I feel indulgent enough, a
										touch of lobster. The creamy, egg-based sauce, blended with Parmigiano
										Reggiano, coats the pasta perfectly, while the seafood brings in a
										burst of briny flavor that takes the whole dish up a notch.
									</p>
								}
								reverse
							/>
						</div>
					</section>
				)}

				{/* Closing Quote */}
				<ScrollReveal>
				<div className="py-20">
					<div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-10 md:p-14 border border-gray-700/50 max-w-4xl mx-auto">
						<div className="absolute -top-6 left-10 text-[#f27d0d] text-8xl font-serif opacity-50">"</div>
						<blockquote className="text-center relative z-10">
							<p className="text-xl md:text-2xl lg:text-3xl text-gray-200 italic leading-relaxed">
								Cooking is like love. It should be entered into with abandon or not at all.
							</p>
							<div className="mt-6 flex items-center justify-center gap-3">
								<div className="w-12 h-px bg-[#f27d0d]"></div>
								<p className="text-[#f27d0d] font-medium">Harriet Van Horne</p>
								<div className="w-12 h-px bg-[#f27d0d]"></div>
							</div>
						</blockquote>
					</div>
				</div>
				</ScrollReveal>
			</div>
			</div>
		</div>
	);
}
