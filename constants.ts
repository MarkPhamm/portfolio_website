export const METADATA = {
	title: "Portfolio | Mark Pham",
	description: "I bridge the gap between data and actionable insights",
	siteUrl: "https://minhbpham.com",
};

// Official site / definition page for each tech. Keys are lowercased so the
// varied casing across the data ("dbt"/"Dbt", "Github", "PowerBI", "alteryx")
// all resolve. Icons render in 3 places — the Skills grid, the project modal,
// and the pipeline DAG — and all look up their link here via getTechUrl().
// Concept-only names (ssh, tcp/ip, dns, normalDis, shell, kmeans) are omitted
// on purpose so they fall back to a plain, non-clickable icon.
export const TECH_LINKS: Record<string, string> = {
	// Business Intelligence
	powerbi: "https://powerbi.microsoft.com/",
	tableau: "https://www.tableau.com/",
	mode: "https://mode.com/",
	hex: "https://hex.tech/",
	looker: "https://cloud.google.com/looker",
	omni: "https://omni.co/",
	// Warehouse and Lakehouse
	snowflake: "https://www.snowflake.com/",
	"aws redshift": "https://aws.amazon.com/redshift/",
	databricks: "https://www.databricks.com/",
	"apache iceberg": "https://iceberg.apache.org/",
	"delta lake": "https://delta.io/",
	// Data Integration
	airbyte: "https://airbyte.com/",
	dlt: "https://dlthub.com/",
	fivetran: "https://www.fivetran.com/",
	stitch: "https://www.stitchdata.com/",
	alteryx: "https://www.alteryx.com/",
	// Orchestration
	"apache airflow": "https://airflow.apache.org/",
	dagster: "https://dagster.io/",
	mageai: "https://www.mage.ai/",
	orchestra: "https://www.getorchestra.io/",
	astronomer: "https://www.astronomer.io/",
	// Data Processing
	dbt: "https://www.getdbt.com/",
	trino: "https://trino.io/",
	spark: "https://spark.apache.org/",
	hive: "https://hive.apache.org/",
	hadoop: "https://hadoop.apache.org/",
	beam: "https://beam.apache.org/",
	// Streaming
	kafka: "https://kafka.apache.org/",
	flink: "https://flink.apache.org/",
	"spark streaming": "https://spark.apache.org/streaming/",
	"kinesis firehose": "https://aws.amazon.com/firehose/",
	pubsub: "https://cloud.google.com/pubsub",
	pulsar: "https://pulsar.apache.org/",
	// Cloud (AWS)
	s3: "https://aws.amazon.com/s3/",
	ec2: "https://aws.amazon.com/ec2/",
	lambda: "https://aws.amazon.com/lambda/",
	mwaa: "https://aws.amazon.com/managed-workflows-for-apache-airflow/",
	vpc: "https://aws.amazon.com/vpc/",
	iam: "https://aws.amazon.com/iam/",
	// DevOps
	docker: "https://www.docker.com/",
	kubernetes: "https://kubernetes.io/",
	github: "https://github.com/",
	terraform: "https://www.terraform.io/",
	aws: "https://aws.amazon.com/",
	gitlab: "https://about.gitlab.com/",
	// Project-only tech
	python: "https://www.python.org/",
	prefect: "https://www.prefect.io/",
	duckdb: "https://duckdb.org/",
	clickhouse: "https://clickhouse.com/",
	fastapi: "https://fastapi.tiangolo.com/",
	minio: "https://min.io/",
	streamlit: "https://streamlit.io/",
	pandas: "https://pandas.pydata.org/",
	matplotlib: "https://matplotlib.org/",
	numpy: "https://numpy.org/",
	excel: "https://www.microsoft.com/en-us/microsoft-365/excel",
	powerquery: "https://learn.microsoft.com/power-query/",
	"microsoft sql server": "https://www.microsoft.com/en-us/sql-server",
	postgresql: "https://www.postgresql.org/",
	"docker compose": "https://docs.docker.com/compose/",
	git: "https://git-scm.com/",
	azure: "https://azure.microsoft.com/",
	langchain: "https://www.langchain.com/",
	openai: "https://openai.com/",
	// Pipeline-only
	hightouch: "https://hightouch.com/",
	snowplow: "https://snowplow.io/",
};

/** Official site for a tech name, or undefined when it has no link. */
export const getTechUrl = (name: string): string | undefined =>
	TECH_LINKS[name.trim().toLowerCase()];

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

export const COMMENTS = [
	{
		comment: "Minh has been a stellar contributor to the Analytics team at Insurify. He excels at communicating with stakeholders and at sharing his deep analytics engineering knowledge with the team — he's genuinely versed in the mechanics of how tools like dbt, Snowflake, and Redshift work under the hood, not just how to use them. He also worked closely and effectively with the SEO team to figure out metrics that actually mattered to them. His passion for the field comes through in an unmatched work ethic, day in and day out. Any organization that values end-to-end data engineering expertise would be lucky to have Minh — he's the real deal.",
		author: "Aaron, Chen",
		position: "Senior Analytics Engineer @ Insurify",
		recomendationType: "work",
		company: "insurify",
		avatar: "/person/aaron.png",
	},
	{
		comment: "I worked with Mark at Insurify, where he owned a large breadth and depth of marketing data models and pipelines. What sets Mark apart is that analytics engineering is not only his career, it's his passion — no one talks about it with such passion and conviction as Mark does. Amongst many great traits and skills, his best is that he is A TEAM MULTIPLIER: an expert IC who multiplies those around him, taking the time to educate and mentor his teammates, unlocking and democratizing analytics for all. If I'm starting a business tomorrow, Mark is my first analytics engineering hire.",
		author: "Noah, Pelberg",
		position: "Product & Analytics @ Insurify",
		recomendationType: "work",
		company: "insurify",
		avatar: "/person/noah.webp",
	},
	{
		comment: "Mark is a huge asset to the team at Insurify and an awesome coworker — smart, hardworking, and someone who really cares about doing things well. He owns several end-to-end data pipelines that support our marketing team. He was one of the first people I met at Insurify, even before I officially joined, and I was immediately impressed by how open, welcoming, and supportive he was. As my mentor in analytics engineering, he guided me through the AE Academy and pushed me to think beyond just writing code — to really understand the data, the business context, and the reasoning behind each decision. He's also hilarious and just a great person to hang out with. Any team would be lucky to have him!",
		author: "Ethan, Liu",
		position: "Data @ Insurify",
		recomendationType: "work",
		company: "insurify",
		avatar: "/person/ethan.webp",
	},
	{
		comment: "Mark was one of the first people I met at Insurify, and his knowledge and expertise made me assume he'd been there for years. During my rotation on the Analytics Engineering team, he took me from 0 to 1 — teaching me dbt, Airflow, and GitHub, and walking me through my first PR. As a business analyst with no prior data engineering experience, it was one of the most impactful months since I started working. What stands out most is how genuinely eager he is to support, train, and invest in new team members. I feel very lucky to have crossed paths with him at the beginning of my career journey. Any team is extremely lucky to have him!",
		author: "Yuki, Fang",
		position: "Data @ Insurify",
		recomendationType: "work",
		company: "insurify",
		avatar: "/person/yuki.webp",
	},
	{
		comment: "I have worked closely with Mark for over a year at Insurify, where he owns the data pipelines that inform our everyday decisions on the marketing team. During this time, I've learned more technical skills from him than from everyone else combined. His exceptional command of SQL, Python, and dbt allows him to solve problems and build with efficiency. Whether it's writing a script to pull conversion data, creating a pipeline to bring a new channel's spend into our database, or making structural improvements to key business tables, Mark will coordinate across teams and make it happen. He is an exemplar of best practice with a work ethic that shows in everything he does. He has been a joy to work with and I can't recommend him highly enough.",
		author: "Max, Brinker",
		position: "Data Analyst @ Insurify",
		recomendationType: "work",
		company: "insurify",
		avatar: "/person/max.webp",
	},
	{
		comment: "Mark is a superb analytics engineer and coworker. At Insurify, he owns a number of data pipelines, including many of the pipelines that drive key marketing channels, and is the human dictionary of our tech stack. He works hard, efficiently, and can write/review the code you need fast. Mark sets the example for learning new technologies and expanding his analytical capabilities. He is a force for progress within Insurify and his contributions have been essential to the team. I am thankful to count him as my coworker and friend.",
		author: "Peter, Manto",
		position: "Business Data Analyst @ Insurify",
		recomendationType: "work",
		company: "insurify",
		avatar: "/person/manto.webp",
	},
	{
		comment: "Minh's exceptional documentation skills stood out significantly. He always meticulously documented every process and project he worked on, ensuring that his contributions would continue to benefit the team long after his internship concluded. His proactive approach and willingness to go above and beyond what was expected of his position truly set him apart.",
		author: "Josef, Cohen",
		position: "Associate Data Engineer - Meta (Ex-Lazard)",
		recomendationType: "college",
		company: "lazard",
		avatar: "/person/josef.webp",
	},
	{
		comment: "He would often visit me during office hours asking questions that demonstrated his commitment to extending his understanding of neural nets, boosting models, feature engineering, and more. Of course, this knowledge grows stale quickly; the point is that Minh has not only \"learned to learn\" but done so under his own initiative. I am certain he will take this work ethic and curiosity forward to his professional opportunities.",
		author: "Kelly, Slaughter",
		position: "BIS Program Director - Texas Christian University",
		recomendationType: "college",
		company: "academia",
		avatar: "/person/slaughter.webp",
	},
	{
		comment: "Hi. How are you doing?? I was out with covid last week and misses your last day in the office.I'd have to say that you were the best intern ever! Willingness to learn and more than enthusiastic to get dropped into anything we could come up with. Hell, you got code and queries into PRD. Nice work!! Hope to see you again in the spring.",
		author: "Tom, Kinch",
		position: "Senior Data Engineer - Lazard",
		recomendationType: "college",
		company: "lazard",
		avatar: "/person/default.webp",
	},
	{
		comment: "Minh is persistent, asks questions, knows when to stop, remembers, and can apply what is said. He only asks once. He is at the top of my class. His maturity level is advanced for his age compared to peers. He will code up more than one solution for insight even though the effort is not tied to his grade.",
		author: "Gary, Klinger",
		position: "Python for Data Analytics Professor - Texas Christian University",
		recomendationType: "college",
		company: "academia",
		avatar: "/person/klinger.webp",
	},
	{
		comment: "Hey Mark, you did a great job overall! The work linking the models to Snowflake and PowerBI are both big improvements in the overall process. The presentation to Joe also went well and I appreciated the preperation and work you put in for that!",
		author: "Luo, Hubert",
		position: "Data Analytic Vice President - Lazard",
		recomendationType: "college",
		company: "lazard",
		avatar: "/person/hubert.webp",
	},
	{
		comment: "I'm incredibly grateful to have had the opportunity to learn from Minh. He's one of the people whose passion for data is truly genuine and inspiring — whether he's writing thoughtful data blogs on Substack, sharing and discussing ideas, or asking questions simply to deepen his understanding, he's constantly learning and refining his craft. His curiosity is contagious. What I appreciate most is the way he mentors: he genuinely believes in his students and encourages us to think deeper instead of simply giving us the answers. He challenges us to be curious, ask better questions, and grow into more confident data professionals. His support and belief in my potential have meant more than he probably realizes. I couldn't recommend him more highly.",
		author: "Mia, Tran",
		position: "GHC '25 | SDS, Quant Econ @ Smith College",
		recomendationType: "mentee",
		company: "mentees",
		avatar: "/person/mia.webp",
	},
	{
		comment: "Mark is the kind of mentor that will push you forward and is very critical of your work — he will not let you look back on failures without lessons attached. At the end of the day, your notes will be full of cool and irreplaceable insights: interview tips, business contexts, and technical updates. He never runs out of cool things to teach you. I believe working with Mark is the fastest way to level up your skills in a corporate setting, even if you've never experienced one.",
		author: "Gwen, Nguyen",
		position: "Cloud & Data Engineer Intern @ Arch Insurance",
		recomendationType: "mentee",
		company: "mentees",
		avatar: "/person/gwen.webp",
	},
	{
		comment: "Mark owns numerous pipelines and alert systems that were proven to improve efficiency across all sites at Insurify. As a coworker, he is credited for his speed and scalability mindset. He is good at what he knows — if he doesn't know, he will by next Monday. Mark will achieve the greatness that is destined for the hard work he has put in. Glad to work and have him as a coworker and a friend.",
		author: "Derek, Le",
		position: "Data @ Insurify | Data Science @ TCU",
		recomendationType: "work",
		company: "insurify",
		avatar: "/person/derek.webp",
	},
	{
		comment: "Minh reached out to me on LinkedIn some time ago to ask about my experience in data engineering, and since then we've exchanged a lot of ideas and knowledge in the field. He is also a technical writer for my newsletter, vutr, and is responsible for the dbt-cli project, a CLI application that lets users learn dbt right on their laptops. What impresses me most about Minh is that he is one of the most proactive, enthusiastic, and dedicated people I have ever met — he doesn't stop until a concept truly clicks, and he can spend an entire weekend working on a task he has committed to. With this kind of spirit, I wouldn't be surprised if he achieves even greater success in the future. Although he sees me as his mentor, there are actually many things I have learned — and continue to learn — from him.",
		author: "Vu, Trinh",
		position: "Data Engineer · vutr.substack.com",
		recomendationType: "mentor",
		company: "mentors",
		avatar: "/person/vu.webp",
	},
	{
		comment: "I highly recommend Minh based on our time working together at Xóm Data. Minh is a skilled professional who consistently demonstrates a deep understanding of data and a strong analytical mindset. He is a natural problem-solver who tackles complex challenges with precision and attention to detail. Minh's technical abilities and collaborative spirit make him a fantastic asset to any data-driven team.",
		author: "Tu, Nguyen",
		position: "Senior Analytics Engineer @ GPBank",
		recomendationType: "mentor",
		company: "mentors",
		avatar: "/person/tu.webp",
	}
]

export interface ITestimonialTheme {
	label: string;
	blurb: string;
	// Values must match COMMENTS[].author exactly — the section derives
	// counts, avatar stacks, and carousel jumps from this lookup.
	authors: string[];
}

export const TESTIMONIAL_THEMES: ITestimonialTheme[] = [
	{
		label: "Mentorship & teaching",
		blurb: "Educates and levels up everyone around him",
		authors: [
			"Aaron, Chen",
			"Noah, Pelberg",
			"Ethan, Liu",
			"Yuki, Fang",
			"Max, Brinker",
			"Mia, Tran",
			"Gwen, Nguyen",
		],
	},
	{
		label: "Owns pipelines end-to-end",
		blurb: "Trusted with the data models decisions run on",
		authors: [
			"Aaron, Chen",
			"Noah, Pelberg",
			"Ethan, Liu",
			"Max, Brinker",
			"Peter, Manto",
			"Derek, Le",
		],
	},
	{
		label: "Deep technical expertise",
		blurb: "SQL, Python, dbt — the team's human dictionary",
		authors: [
			"Aaron, Chen",
			"Max, Brinker",
			"Peter, Manto",
			"Yuki, Fang",
			"Luo, Hubert",
			"Tom, Kinch",
			"Tu, Nguyen",
		],
	},
	{
		label: "Passion & fast learning",
		blurb: "Genuine drive; learns anything by next Monday",
		authors: [
			"Aaron, Chen",
			"Noah, Pelberg",
			"Kelly, Slaughter",
			"Gary, Klinger",
			"Mia, Tran",
			"Josef, Cohen",
			"Derek, Le",
			"Vu, Trinh",
		],
	},
	{
		label: "Team multiplier",
		blurb: "Coordinates across teams and lifts everyone's output",
		authors: [
			"Aaron, Chen",
			"Noah, Pelberg",
			"Max, Brinker",
			"Peter, Manto",
			"Derek, Le",
		],
	},
	{
		label: "Goes above & beyond",
		blurb: "Does more than the role asks — every time",
		authors: [
			"Aaron, Chen",
			"Josef, Cohen",
			"Tom, Kinch",
			"Gary, Klinger",
			"Luo, Hubert",
			"Vu, Trinh",
		],
	},
	{
		label: "Speed & efficiency",
		blurb: "Ships fast with a scalability mindset",
		authors: ["Derek, Le", "Max, Brinker", "Peter, Manto"],
	},
	{
		label: "Docs & best practices",
		blurb: "Meticulous documentation that outlives the project",
		authors: ["Josef, Cohen", "Max, Brinker", "Luo, Hubert"],
	},
];

export const TYPED_STRINGS = [
	'<span style="color:#9146FF">1000+</span> SQL questions solved',
	'<span style="color:#9146FF">Analytics Engineer</span> @Insurify',
	'<span style="color:#9146FF">TCU</span> class of 2025',
	'<span style="color:#9146FF">Boston, MA</span>',
];

export const QUOTE_STRINGS = [
	'Analytics isn\'t just my job - it\'s my <span style="color:#9146FF">obsession</span>',
	'Always run the <span style="color:#9146FF">extra miles</span>',
	'I don\'t just <span style="color:#9146FF">"meet"</span> expectations - I go <span style="color:#9146FF">beyond</span> them',
	'Turning <span style="color:#9146FF">raw data</span> into <span style="color:#9146FF">actionable insights</span>',
];

export const SOCIAL_LINKS = {
	linkedin: "https://www.linkedin.com/in/minhbphamm/",
	github: "https://github.com/MarkPhamm",
	substack: "https://substack.com/@markphammm/posts",
	wakatime: "https://wakatime.com/@MarkPham",
	leetcode: "https://leetcode.com/u/markphammm/",
	discord: "https://discord.com/users/756173543431209071",
};

export interface IProject {
	name: string;
	category: string;
	image: string;
	description: string;
	gradient: [string, string];
	url: string;
	tech: string[];
	fullDescription?: string;
	impact?: string[];
	featured?: boolean;
}

export const ProjectTypes = {
	FEATURED: "Featured",
	ENDTOEND: "End-to-End Data Analytics",
	BIDASHBOARDVIZ: "BI - Dashboard - Visualization",
	STATISTICSML: "Statistics - ML - AI Project",
	CLOUDINFRA: "Cloud - Infrastructure",
	LEARNING: "Learning",
}

export const PROJECTS: IProject[] = [
	// Data Pipeline projects
	{
		name: "Skytrax Reviews Extract & Load",
		category: ProjectTypes.ENDTOEND,
		image: "/projects/skytrax_2.webp",
		description: "Production-grade pipeline scraping 160K+ airline reviews with 26 parallel Airflow tasks, staging in S3, and loading into Snowflake.",
		gradient: ["#1b1b1b", "#d8d8d8"],
		url: "https://github.com/MarkPhamm/skytrax_reviews_extract_load",
		tech: ["Apache Airflow", "python", "S3", "Snowflake", "Terraform"],
		fullDescription: "Scrapes 160K+ airline reviews using 26 parallel Airflow tasks, stages in S3, and loads into Snowflake. Infra managed with Terraform and GitHub Actions CI/CD.",
		impact: ["160K+ reviews", "26 parallel Airflow tasks", "Fully automated CI/CD"],
		featured: true,
	},
	{
		name: "Skytrax Reviews Transformation",
		category: ProjectTypes.ENDTOEND,
		image: "/projects/skytrax.webp",
		description: "Kimball star-schema transformation layer with dbt, slim CI/CD via GitHub Actions, OIDC auth, and auto-deployed dbt docs on CloudFront.",
		gradient: ["#1b1b1b", "#4a90d9"],
		url: "https://github.com/MarkPhamm/skytrax_reviews_transformation",
		tech: ["Dbt", "Snowflake", "Terraform", "Github", "Apache Airflow"],
		fullDescription: "Kimball star-schema transformations with dbt on Snowflake. Slim CI/CD via GitHub Actions with OIDC auth and auto-deployed dbt docs on CloudFront.",
		impact: ["Kimball star-schema", "Slim CI/CD pipeline", "Deployed dbt docs"],
		featured: true,
	},
	{
		name: "Consumer Complaint Pipeline",
		category: ProjectTypes.ENDTOEND,
		image: "/projects/consumer.webp",
		description: "Scalable data pipeline processing consumer complaints with Airflow orchestration, dbt transformations, and Snowflake storage.",
		gradient: ["#0a4c6a", "#1b7fa1"],
		url: "https://github.com/MarkPhamm/consumer_complaint_pipeline",
		tech: ["python", "Apache Airflow", "Dbt", "Snowflake", "Docker"],
	},
	{
		name: "Local Warehouse",
		category: ProjectTypes.ENDTOEND,
		image: "/projects/local_elt2.webp",
		description: "End-to-end ELT pipeline using dbt, Prefect, and DuckDB for local data warehousing with automated transformations.",
		gradient: ["#1e3a8a", "#3b82f6"],
		url: "https://github.com/MarkPhamm/local_warehouse",
		tech: ["Dbt", "prefect", "duckdb", "dlt", "Github"],
		featured: true,
	},
	{
		name: "Local Streaming Pipeline",
		category: ProjectTypes.ENDTOEND,
		image: "/projects/streaming_pipeline.webp",
		description: "Real-time analytics pipeline ingesting crypto prices via Kafka, processing with Spark/Flink, and visualizing in ClickHouse dashboards.",
		gradient: ["#0f2027", "#2c5364"],
		url: "https://github.com/MarkPhamm/local_streaming_pipeline",
		tech: ["Kafka", "Spark", "Flink", "ClickHouse", "FastAPI"],
		fullDescription: "Ingests live data via Kafka, processes with Spark and Flink, stores in ClickHouse, and serves via FastAPI. Containerized with Docker Compose.",
		impact: ["Real-time ingestion", "Spark + Flink processing", "ClickHouse OLAP"],
	},
	{
		name: "Local Lakehouse Pipeline",
		category: ProjectTypes.ENDTOEND,
		image: "/projects/lakehouse_pipeline.webp",
		description: "Local lakehouse architecture processing NYC taxi data through a medallion pattern using Dagster, MinIO, Iceberg, Trino, and dbt.",
		gradient: ["#1a1a2e", "#16213e"],
		url: "https://github.com/MarkPhamm/local_lakehouse_pipeline",
		tech: ["Dagster", "MinIO", "Apache Iceberg", "Trino", "Dbt"],
	},
	{
		name: "AWS Infrastructure",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/aws_infra.webp",
		description: "AWS data engineering infrastructure with Terraform — VPC, MWAA Airflow, S3, EC2, and GitHub Actions OIDC CI/CD.",
		gradient: ["#1a0a2e", "#ff9900"],
		url: "https://github.com/MarkPhamm/AWS",
		tech: ["S3", "EC2", "Lambda", "MWAA", "Terraform"],
	},
	{
		name: "Airflow MWAA CI/CD",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/amazon_mwaa.webp",
		description: "CI/CD pipeline for Apache Airflow on AWS MWAA — GitHub Actions linting, OIDC auth, and automated DAG syncing to S3.",
		gradient: ["#1a0a2e", "#ff9900"],
		url: "https://github.com/MarkPhamm/airflow_mwaa_CICD",
		tech: ["MWAA", "Github", "S3", "Terraform", "Apache Airflow"],
	},
	{
		name: "Docker",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/docker.webp",
		description: "Hands-on Docker learning — from container basics and image building to multi-container orchestration with docker-compose.",
		gradient: ["#0db7ed", "#384d54"],
		url: "https://github.com/MarkPhamm/Docker",
		tech: ["Docker", "python", "Docker Compose", "Shell"],
	},
	{
		name: "Networking 101",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/networking.webp",
		description: "Networking for data engineering — VPC/subnets, SSH, LAN/WAN, TCP/IP, DNS, and cloud infrastructure connectivity.",
		gradient: ["#1a1a2e", "#4a90d9"],
		url: "https://github.com/MarkPhamm/Networking-101",
		tech: ["VPC", "SSH", "TCP/IP", "DNS"],
	},
	// ML & Statistics projects
	{
		name: "Streamlit Statistics App",
		category: ProjectTypes.STATISTICSML,
		image: "/projects/stats_calc.webp",
		description: "Interactive statistics calculator built with Streamlit for hypothesis testing, confidence intervals, and distributions.",
		gradient: ["#191414", "#f5f5f5"],
		url: "https://github.com/MarkPhamm/Stats-Calculator",
		tech: ["python", "streamlit", "normalDis", "Pandas", "Matplotlib"],
		featured: true,
	},
	{
		name: "Housing Purchase Predictor",
		category: ProjectTypes.STATISTICSML,
		image: "/projects/housing.webp",
		description: "ML-powered housing price predictor using ensemble models with an interactive Streamlit interface.",
		gradient: ["#2a5298", "#1e3a5f"],
		url: "https://github.com/MarkPhamm/housing_purchase_predictor",
		tech: ["python", "streamlit", "Pandas", "Matplotlib", "numpy"],
	},
	// BI & Dashboard projects
	{
		name: "Marketing Campaign Analysis",
		category: ProjectTypes.BIDASHBOARDVIZ,
		image: "/projects/mktg_campaign.webp",
		description: "End-to-end marketing campaign ROI analysis with Alteryx data prep and Power BI executive dashboards.",
		gradient: ["#f2ece4", "#09091a"],
		url: "https://mavenshowcase.com/project/19447",
		tech: ["PowerBI", "alteryx", "excel", "powerquery", "Microsoft SQL Server"],
		featured: true,
	},
	{
		name: "EaseMyTrip Airline Dashboard",
		category: ProjectTypes.BIDASHBOARDVIZ,
		image: "/projects/easemytrip.webp",
		description: "Interactive airline pricing dashboard analyzing EaseMyTrip flight data with Power BI visualizations and travel insights.",
		gradient: ["#1a2a6c", "#b21f1f"],
		url: "https://mavenshowcase.com/project/19418",
		tech: ["PowerBI", "excel", "powerquery", "Microsoft SQL Server"],
	},
	// Learning projects
	{
		name: "LeetCode Solutions",
		category: ProjectTypes.LEARNING,
		image: "/projects/leetcode.webp",
		description: "489+ LeetCode solutions in Python and SQL covering arrays, dynamic programming, graphs, and database queries.",
		gradient: ["#1a1a2e", "#ffa116"],
		url: "https://github.com/MarkPhamm/Leetcode",
		tech: ["python", "PostgreSQL"],
		featured: true,
	},
	{
		name: "TensorTonic Solutions",
		category: ProjectTypes.LEARNING,
		image: "/projects/tensortonic.webp",
		description: "ML and deep learning fundamentals implemented from scratch — neural networks, loss functions, linear algebra, and statistics.",
		gradient: ["#1a1a2e", "#e94560"],
		url: "https://github.com/MarkPhamm/TensorTonic-Solutions",
		tech: ["python"],
	},
	// {
	// 	name: "Alcon Competitors Analysis",
	// 	category: ProjectTypes.STATISTICSML,
	// 	image: "/projects/alcon.webp",
	// 	description: "",
	// 	gradient: ["#167187", "#09091a"],
	// 	url: "https://github.com/MarkPhamm/Alcon-Financial-Assistant",
	// 	tech: ["python", "Pandas", "streamlit", "langchain", "openai"],
	// },
	// {
	// 	name: "Sample Sales Dashboard",
	// 	category: ProjectTypes.BIDASHBOARDVIZ,
	// 	image: "/projects/sample_sale.webp",
	// 	description: "",
	// 	gradient: ["#ffddaa", "#49789d"],
	// 	url: "https://public.tableau.com/app/profile/minh.pham1154/viz/GlobalSuperstoreSalesDashboard_16962776044380/SalesDashboard",
	// 	tech: ["excel", "alteryx", "tableau", "powerquery", "Microsoft SQL Server"],
	// },
	// {
	// 	name: "AdventureWorks Analytics",
	// 	category: ProjectTypes.ENDTOEND,
	// 	image: "/projects/adventurework.webp",
	// 	description: "",
	// 	gradient: ["#003052", "#167187"],
	// 	url: "https://github.com/MarkPhamm/Adventureworks-Analytics",
	// 	tech: ["python", "Microsoft SQL Server", "PowerBI", "azure", "Git"],
	// },
	// {
	// 	name: "Segment Shopping Customers",
	// 	category: ProjectTypes.STATISTICSML,
	// 	image: "/projects/segment_shopping_cus.webp",
	// 	description: "",
	// 	gradient: ["#ccb08f", "#f2ece4"],
	// 	url: "https://github.com/MarkPhamm/Python-Segment-Shopping-Customers",
	// 	tech: ["python", "numpy", "Pandas", "Matplotlib", "Git"],
	// },
	// {
	// 	name: "EaseMyTrip Airline Dashboard",
	// 	category: ProjectTypes.BIDASHBOARDVIZ,
	// 	image: "/projects/easemytrip.webp",
	// 	description: "",
	// 	gradient: ["#167187", "#49789d"],
	// 	url: "https://mavenshowcase.com/project/19418",
	// 	tech: ["PowerBI", "alteryx", "excel", "powerquery", "Microsoft SQL Server"],
	// },
	// {
	// 	name: "United Ways Tax Advisor Chatbot",
	// 	category: ProjectTypes.STATISTICSML,
	// 	image: "/projects/comingsoon.webp",
	// 	description: "",
	// 	gradient: ["#49789d", "#ffddaa"],
	// 	url: "",
	// 	tech: ["python", "langchain", "openai", "streamlit", "Github"],
	// }
];

export const SKILLS = {
	"Business Intelligence": [
		"PowerBI",
		"Tableau",
		"Mode",
		"Hex",
		"Looker",
		"Omni"
	],
	"Warehouse and Lakehouse": [
		"Snowflake",
		"AWS Redshift",
		"Databricks",
		"Apache Iceberg",
		"Delta Lake",
		"ClickHouse"
	],
	"Data Integration": [
		"Airbyte",
		"Dlt",
		"Fivetran",
		"stitch",
		"alteryx",
		"Hightouch"
	],
	"Orchestration": [
		"Apache Airflow",
		"Dagster",
		"MageAI",
		"Orchestra",
		"Astronomer",
		"Prefect"
	],
	"Data Processing": [
		"dbt",
		"Trino",
		"Spark",
		"Hive",
		"Hadoop",
		"Beam"
	],
	"Streaming": [
		"Kafka",
		"Flink",
		"Spark Streaming",
		"Kinesis Firehose",
		"PubSub",
		"Pulsar"
	],
	"Cloud (AWS)": [
		"S3",
		"EC2",
		"Lambda",
		"MWAA",
		"VPC",
		"IAM"
	],
	"DevOps": [
		"Docker",
		"Kubernetes",
		"Github",
		"Terraform",
		"AWS",
		"GitLab"
	],

	certified: [
		"Certified Scrum Product Owner",
		"SQL Advanced Hackerrank Certification",
		"DataCamp Certified Data Analyst",
	],
	relevant: [
		"Business Intelligence (Tableau, Alteryx, Google Looker Studio)",
		"Database Management System (SQL Server, MongoDB, Data Modelling, ETL Pipelines)",
		"Statistical Modelling (A/B test, T-test, Chi-Square, Linear Regression)",
		"System planning (Agile, Scrum, Kanban, Jira, SDLC, Lean 6σ)",
	],
	sqlprob: [
		"602 SQL questions solved",
		"87 Leetcode problems solved",
		"45 Hackerrank problems solved",
	],
	alteryx: "Alteryx",
	hackerank: "HackerRank",
	airflow: "Airflow",
};

export interface ICertificate {
	name: string;
	issuer: string;
	image: string; // file name under /public/skills/3rd/ (webp)
}

export const CERTIFICATES: ICertificate[] = [
	{
		name: "Alteryx Core Designer",
		issuer: "Alteryx",
		image: "alteryx",
	},
	{
		name: "SQL Advanced",
		issuer: "HackerRank",
		image: "HackerRank",
	},
	{
		name: "Apache Airflow Certified",
		issuer: "Astronomer",
		image: "airflow",
	},
];

export const SQLCode = {
	sql1: `SELECT * FROM marketing_campaign
ORDER BY 1,2`,
};

export const COURSES = {
	bi: ["tableu", "alteryx", "GCP Looker"],
	dbms: ["Microsoft SQL Server", "mongodb", "datamodel", "datapipe"],
	stats: [
		"AB Test",
		"T-Test",
		"Chi-Square",
		"regression",
		"Confidence Interval",
	],
	sysplan: ["Agile", "Scrum", "Kanban", "Jira", "Sdlc", "Lean 6σ"],
};

export enum Branch {
	LEFT = "leftSide",
	RIGHT = "rightSide",
}

export enum NodeTypes {
	CONVERGE = "converge",
	DIVERGE = "diverge",
	CHECKPOINT = "checkpoint",
}

export enum ItemSize {
	SMALL = "small",
	LARGE = "large",
}

export const TIMELINE: Array<TimelineNodeV2> = [
	{
		type: NodeTypes.CHECKPOINT,
		title: "June 2025",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "Analytics Engineer - <a class='underline underline-offset-2' href='https://insurify.com' target='_blank' rel='noopener noreferrer'><u>Insurify</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"$600M Series B insurance aggregator",
		location: "Boston",
		image: "/timeline/insurify.webp",
		slideImage: "/timeline/insurify.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/insurify.webp",
		companyUrl: "https://insurify.com",
		techStack: [
			{ name: "Redshift", icon: "/skills/1st/AWS Redshift.svg" },
			{ name: "dbt", icon: "/skills/1st/dbt.svg" },
			{ name: "Mode", icon: "/skills/1st/Mode.svg" },
			{ name: "Hex", icon: "/skills/1st/Hex.svg" },
			{ name: "Airflow", icon: "/skills/1st/Apache Airflow.svg" },
			{ name: "Airbyte", icon: "/skills/1st/Airbyte.svg" },
			{ name: "Terraform", icon: "/skills/1st/Terraform.svg" },
		],
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "May 2025",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "Data Mentor - <a class='underline underline-offset-2' href='https://acementorship.com/' target='_blank' rel='noopener noreferrer'><u>Ace Mentorships</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"Data career mentorship platform",
		location: "Remote",
		image: "/timeline/Ace.webp",
		slideImage: "/timeline/Ace.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/Ace.webp",
		companyUrl: "https://acementorship.com/",
		techStack: [
			{ name: "Snowflake", icon: "/skills/1st/Snowflake.svg" },
			{ name: "dbt", icon: "/skills/1st/dbt.svg" },
			{ name: "Mode", icon: "/skills/1st/Mode.svg" },
			{ name: "Airflow", icon: "/skills/1st/Apache Airflow.svg" },
			{ name: "Python", icon: "/projects/tech/python.svg" },
			{ name: "Terraform", icon: "/skills/1st/Terraform.svg" },
		],
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "June 2024",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "Data Engineering Intern - <a class='underline underline-offset-2' href='https://www.lazard.com/' target='_blank' rel='noopener noreferrer'><u>Lazard</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"Elite investment bank · $240B AUM",
		location: "New York City",
		image: "/timeline/lazard.webp",
		slideImage: "/timeline/lazard.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/lazard.webp",
		companyUrl: "https://www.lazard.com/",
		techStack: [
			{ name: "Snowflake", icon: "/skills/1st/Snowflake.svg" },
			{ name: "dbt", icon: "/skills/1st/dbt.svg" },
			{ name: "Power BI", icon: "/skills/1st/PowerBI.svg" },
			{ name: "Python", icon: "/projects/tech/python.svg" },
			{ name: "Streamlit", icon: "/projects/tech/streamlit-mark.svg" },
		],
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "January 2024",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title:
			"BI Engineering Intern - <a class='underline underline-offset-2' href='https://www.techsmith.com/' target='_blank' rel='noopener noreferrer'><u>Techsmith</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"Snagit & Camtasia · 30M+ users",
		location: "Remote",
		image: "/timeline/techsmith.webp",
		slideImage: "/timeline/techsmith.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/techsmith.webp",
		companyUrl: "https://www.techsmith.com/",
		techStack: [
			{ name: "Kafka", icon: "/skills/1st/Kafka.svg" },
			{ name: "Databricks", icon: "/skills/1st/Databricks.svg" },
			{ name: "Excel", icon: "/projects/tech/excel.svg" },
			{ name: "Power BI", icon: "/skills/1st/PowerBI.svg" },
			{ name: "SQL Server", icon: "/projects/tech/Microsoft SQL Server.svg" },
		],
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "January 2023",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title:
			"Data Analyst Intern - <a class='' href='https://www.corning.com/worldwide/en.html' target='_blank' rel='noopener noreferrer'><u>Corning Inc</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"Fortune 500 · Gorilla Glass maker",
		location: "Keller",
		image: "/timeline/Corning.png",
		slideImage: "/timeline/Corning.jpg",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/Corning.png",
		companyUrl: "https://www.corning.com/worldwide/en.html",
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "October 2022",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "Product Management Intern - Stealth",
		size: ItemSize.SMALL,
		subtitle:
			"Stealth fintech startup · Payments",
		location: "Remote",
		image: "/timeline/Stealth1.webp",
		slideImage: "/timeline/Stealth.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/Stealth1.webp",
		techStack: [
			{ name: "Python", icon: "/projects/tech/python.svg" },
			{ name: "PostgreSQL", icon: "/projects/tech/PostgreSQL.svg" },
			{ name: "Power BI", icon: "/skills/1st/PowerBI.svg" },
			{ name: "Excel", icon: "/projects/tech/excel.svg" },
		],
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "June 2022",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title:
			"Data Analyst intern - <a class='' href='https://en.napas.com.vn/' target='_blank' rel='noopener noreferrer'><u>NAPAS Vietnam</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"Vietnam's national payment switch",
		location: "Remote",
		image: "/timeline/NAPAS1.webp",
		slideImage: "/timeline/NAPAS.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/NAPAS1.webp",
		companyUrl: "https://en.napas.com.vn/",
		techStack: [
			{ name: "Hadoop", icon: "/skills/1st/Hadoop.webp" },
			{ name: "Spark", icon: "/skills/1st/Spark.svg" },
			{ name: "Excel", icon: "/projects/tech/excel.svg" },
			{ name: "Power BI", icon: "/skills/1st/PowerBI.svg" },
			{ name: "Python", icon: "/projects/tech/python.svg" },
			{ name: "PostgreSQL", icon: "/projects/tech/PostgreSQL.svg" },
		],
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "May 2022",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},

	{
		type: NodeTypes.CHECKPOINT,
		title:
			"Data Analyst intern - <a class='' href='https://kpim.vn/' target='_blank' rel='noopener noreferrer'><u>KPIM Consulting</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"Vietnam BI consulting firm",
		location: "Remote",
		image: "/timeline/KPIM1.webp",
		slideImage: "/timeline/KPIM.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/KPIM1.webp",
		companyUrl: "https://kpim.vn/",
		techStack: [
			{ name: "SQL Server", icon: "/projects/tech/Microsoft SQL Server.svg" },
			{ name: "Excel", icon: "/projects/tech/excel.svg" },
			{ name: "Power BI", icon: "/skills/1st/PowerBI.svg" },
			{ name: "Python", icon: "/projects/tech/python.svg" },
		],
	},

	{
		type: NodeTypes.CHECKPOINT,
		title: "May 2020",
		size: ItemSize.LARGE,
		shouldDrawLine: false,
		alignment: Branch.LEFT,
	},
	{
		type: NodeTypes.CHECKPOINT,
		title: "CEO, Founder - <a class='underline underline-offset-2' href='https://www.facebook.com/thecoconut.vn/' target='_blank' rel='noopener noreferrer'><u>The Coconut Consulting Academy</u></a>",
		size: ItemSize.SMALL,
		subtitle:
			"US college admissions consulting",
		location: "Remote",
		image: "/timeline/Coconut.webp",
		slideImage: "/timeline/Coconut.webp",
		shouldDrawLine: true,
		alignment: Branch.LEFT,
		companyLogo: "/timeline/Coconut.webp",
		companyUrl: "https://www.facebook.com/thecoconut.vn/",
	},

];

export type TimelineNodeV2 = CheckpointNode | BranchNode;

export interface CheckpointNode {
	type: NodeTypes.CHECKPOINT;
	title: string;
	subtitle?: string;
	location?: string;
	size: ItemSize;
	image?: string;
	slideImage?: string;
	shouldDrawLine: boolean;
	alignment: Branch;
	companyLogo?: string;
	companyUrl?: string;
	techStack?: Array<{ name: string; icon: string }>;
}

export interface BranchNode {
	type: NodeTypes.CONVERGE | NodeTypes.DIVERGE;
}

export interface IArticle {
	title: string;
	excerpt: string;
	thumbnail: string;
	url: string;
	date: string;
	readingTime: string;
	tag: string;
}

export const ARTICLES: IArticle[] = [
	{
		title: "The Productivity Stack I Actually Use as an Analytics Engineer",
		excerpt: "The tools, workflows, and habits that keep me productive as an analytics engineer — from IDE setup to daily rituals.",
		thumbnail: "/article/productivity.webp",
		url: "https://substack.com/home/post/p-191266646",
		date: "Mar 2026",
		readingTime: "10 min read",
		tag: "Productivity",
	},
	{
		title: "Component of a Technical Data Project (Part 1 - The Prerequisite)",
		excerpt: "Breaking down the essential components every technical data project needs before writing a single line of code.",
		thumbnail: "/article/part1.webp",
		url: "https://substack.com/@markphammm/p-178000757",
		date: "Jan 2026",
		readingTime: "8 min read",
		tag: "Data Engineering",
	},
	{
		title: "Component of a Technical Data Project (Part 2 – Building Blocks)",
		excerpt: "The core building blocks of a technical data project — from ingestion and storage to transformation and serving.",
		thumbnail: "/article/part2.webp",
		url: "https://substack.com/@markphammm/p-178105495",
		date: "Feb 2026",
		readingTime: "7 min read",
		tag: "Data Engineering",
	},
];

// "reading" gets a pulsing purple dot ("Currently reading"), "must-read" a
// star pill. Leave undefined for the steady-state majority of items.
export type ReadStatus = "reading" | "must-read";

export interface IFavoriteRead {
	title: string;
	author: string;
	description: string;
	url: string;
	domain: string; // used to build the favicon URL + shown as a pill
	category: string;
	image?: string; // optional local avatar in /public; overrides the favicon
	date?: string; // optional publish date, shown in the article list meta row
	cover?: string; // optional article cover art (list layout); falls back to image
	take?: string; // optional first-person one-liner — my take, in my voice
	status?: ReadStatus;
}

// Per-category accent (same spirit as FOLDER_COLORS in the IDE testimonials):
// pill border/text pick up the category's color; card chrome stays purple.
export const READ_CATEGORY_COLORS: Record<string, string> = {
	"Data Science": "#5eead4",
	"Data Engineering": "#38bdf8",
	"Career & Ops": "#fbbf24",
	"Life & Reflection": "#f472b6",
	Psychology: "#fb7185",
	Philosophy: "#fb923c",
};

export const readCategoryColor = (category: string): string =>
	READ_CATEGORY_COLORS[category] ?? "#BF94FF";

// Shown in the reads hero — bump manually when the lists change, same
// discipline as VERSION.md.
export const READS_LAST_UPDATED = "Aug 2026";

export const FAVORITE_READS: IFavoriteRead[] = [
	{
		title: "Variance Explained",
		author: "David Robinson",
		description: "Stats stuff from an Anthropic Member of Technical Staff.",
		url: "http://varianceexplained.org/posts/",
		domain: "varianceexplained.org",
		category: "Data Science",
		image: "/reads/variance_explained.png",
		take: "Stats intuition from someone who actually ships.",
	},
	{
		title: "VuTrinh.",
		author: "Vu Trinh",
		description:
			"Data Engineer · Trusted by 18,000+ engineers · I write what it takes to become a production-ready data engineer.",
		url: "https://vutr.substack.com/",
		domain: "vutr.substack.com",
		category: "Data Engineering",
		image: "/reads/vutrinh.jpg",
		take: "The first newsletter I open — pipelines explained the way I wish my textbooks had.",
		status: "reading",
	},
	{
		title: "The Operator's Handbook",
		author: "Torsten Walbaum",
		description:
			"Operating frameworks and career advice drawn from years as an operator at Uber, Meta, and Rippling.",
		url: "https://www.operatorshandbook.com/",
		domain: "operatorshandbook.com",
		category: "Career & Ops",
		take: "Reread this whenever I catch myself over-engineering my career plans.",
	},
	{
		title: "mixtapes by gor",
		author: "Goransh Bharal",
		description: "I want to memorize your taste like my favorite coffee.",
		url: "https://substack.com/@goranshbharal",
		domain: "substack.com",
		category: "Life & Reflection",
		image: "/reads/gor.png",
	},
	{
		title: "The Forbidden Files",
		author: "ixcarus",
		description:
			"Secret knowledge. Public platform. If you get it, you get it. Reject mediocrity or go away.",
		url: "https://substack.com/@ixcarus",
		domain: "substack.com",
		category: "Psychology",
		image: "/reads/the_forbidden_files.png",
	},
	{
		title: "Conquer",
		author: "conquer1",
		description: "Fix your attention, find your mission, Conquer.",
		url: "https://substack.com/@conquer1",
		domain: "substack.com",
		category: "Philosophy",
		image: "/reads/conquer.png",
	},
];

// Individual posts worth reading in full (vs FAVORITE_READS, which are whole
// publications). Reuses IFavoriteRead — `author` is the publication and
// `domain` is the article's host.
export const FAV_ARTICLES: IFavoriteRead[] = [
	{
		title: "You Don't Have What You Want Because You Don't Want It Enough",
		author: "Conquer",
		description:
			"How a culture of instant gratification and detachment quietly kills the intense desire that drives real achievement.",
		url: "https://conquer1.substack.com/p/you-dont-have-what-you-want-because-78c",
		domain: "conquer1.substack.com",
		category: "Philosophy",
		image: "/reads/conquer.png",
		cover: "/reads/want.png",
		date: "Feb 24, 2026",
		take: "The essay that made me delete three apps the same night.",
		status: "must-read",
	},
	{
		title: "How To Win At Everything In Life: Becoming A Jack Of All Trades",
		author: "The Forbidden Files",
		description:
			"How to become fit, sharp, balanced, and independent across every domain — once you get over the embarrassment of trying hard.",
		url: "https://ixcarus.substack.com/p/how-to-win-at-everything-in-life",
		domain: "ixcarus.substack.com",
		category: "Psychology",
		image: "/reads/the_forbidden_files.png",
		cover: "/reads/jack.png",
		date: "Apr 7, 2026",
	},
	{
		title: "No, don't compete with yesterday you",
		author: "Conquer",
		description:
			"Why \"1% better every day\" falls apart when you start from zero — and the three things that actually work: a rival, better company, and a mentor.",
		url: "https://conquer1.substack.com/p/no-dont-compete-with-yesterday-you",
		domain: "conquer1.substack.com",
		category: "Philosophy",
		image: "/reads/conquer.png",
		cover: "/reads/compare.png",
		date: "Dec 3, 2025",
	},
];
