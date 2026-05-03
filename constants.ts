// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const METADATA = {
	title: "Portfolio | Mark Pham",
	description: "I bridge the gap between data and actionable insights",
	siteUrl: "https://minhbpham.com",
};

export const NAVBARITEMS = [
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
];

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
];

export const COMMENTS = [
	{
		comment: "Minh's exceptional documentation skills stood out significantly. He always meticulously documented every process and project he worked on, ensuring that his contributions would continue to benefit the team long after his internship concluded. His proactive approach and willingness to go above and beyond what was expected of his position truly set him apart.",
		author: "Josef, Cohen",
		position: "Associate Data Engineer - Meta (Ex-Lazard)",
		recomendationType: "college",
		avatar: "/person/josef.webp",
	},
	{
		comment: "He would often visit me during office hours asking questions that demonstrated his commitment to extending his understanding of neural nets, boosting models, feature engineering, and more. Of course, this knowledge grows stale quickly; the point is that Minh has not only \"learned to learn\" but done so under his own initiative. I am certain he will take this work ethic and curiosity forward to his professional opportunities.",
		author: "Kelly, Slaughter",
		position: "BIS Program Director - Texas Christian University",
		recomendationType: "college",
		avatar: "/person/slaughter.webp",
	},
	{
		comment: "Hi. How are you doing?? I was out with covid last week and misses your last day in the office.I'd have to say that you were the best intern ever! Willingness to learn and more than enthusiastic to get dropped into anything we could come up with. Hell, you got code and queries into PRD. Nice work!! Hope to see you again in the spring.",
		author: "Tom, Kinch",
		position: "Senior Data Engineer - Lazard",
		recomendationType: "college",
		avatar: "/person/default.webp",
	},
	{
		comment: "Minh is persistent, asks questions, knows when to stop, remembers, and can apply what is said. He only asks once. He is at the top of my class. His maturity level is advanced for his age compared to peers. He will code up more than one solution for insight even though the effort is not tied to his grade.",
		author: "Gary, Klinger",
		position: "Python for Data Analytics Professor - Texas Christian University",
		recomendationType: "college",
		avatar: "/person/klinger.webp",
	},
	{
		comment: "Hey Mark, you did a great job overall! The work linking the models to Snowflake and PowerBI are both big improvements in the overall process. The presentation to Joe also went well and I appreciated the preperation and work you put in for that!",
		author: "Luo, Hubert",
		position: "Data Analytic Vice President - Lazard",
		recomendationType: "college",
		avatar: "/person/hubert.webp",
	}
]

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
	blurImage: string;
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
		blurImage: "/projects/skytrax_2.webp",
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
		blurImage: "/projects/skytrax.webp",
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
		blurImage: "/projects/consumer.webp",
		description: "Scalable data pipeline processing consumer complaints with Airflow orchestration, dbt transformations, and Snowflake storage.",
		gradient: ["#0a4c6a", "#1b7fa1"],
		url: "https://github.com/MarkPhamm/consumer_complaint_pipeline",
		tech: ["python", "Apache Airflow", "Dbt", "Snowflake", "Docker"],
	},
	{
		name: "Local Warehouse",
		category: ProjectTypes.ENDTOEND,
		image: "/projects/local_elt2.webp",
		blurImage: "/projects/local_elt2.webp",
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
		blurImage: "/projects/streaming_pipeline.webp",
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
		blurImage: "/projects/lakehouse_pipeline.webp",
		description: "Local lakehouse architecture processing NYC taxi data through a medallion pattern using Dagster, MinIO, Iceberg, Trino, and dbt.",
		gradient: ["#1a1a2e", "#16213e"],
		url: "https://github.com/MarkPhamm/local_lakehouse_pipeline",
		tech: ["Dagster", "MinIO", "Apache Iceberg", "Trino", "Dbt"],
	},
	{
		name: "AWS Infrastructure",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/aws_infra.webp",
		blurImage: "/projects/aws_infra.webp",
		description: "AWS data engineering infrastructure with Terraform — VPC, MWAA Airflow, S3, EC2, and GitHub Actions OIDC CI/CD.",
		gradient: ["#1a0a2e", "#ff9900"],
		url: "https://github.com/MarkPhamm/AWS",
		tech: ["S3", "EC2", "Lambda", "MWAA", "Terraform"],
	},
	{
		name: "Airflow MWAA CI/CD",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/amazon_mwaa.webp",
		blurImage: "/projects/amazon_mwaa.webp",
		description: "CI/CD pipeline for Apache Airflow on AWS MWAA — GitHub Actions linting, OIDC auth, and automated DAG syncing to S3.",
		gradient: ["#1a0a2e", "#ff9900"],
		url: "https://github.com/MarkPhamm/airflow_mwaa_CICD",
		tech: ["MWAA", "Github", "S3", "Terraform", "Apache Airflow"],
	},
	{
		name: "Docker",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/docker.webp",
		blurImage: "/projects/docker.webp",
		description: "Hands-on Docker learning — from container basics and image building to multi-container orchestration with docker-compose.",
		gradient: ["#0db7ed", "#384d54"],
		url: "https://github.com/MarkPhamm/Docker",
		tech: ["Docker", "python", "Docker Compose", "Shell"],
	},
	{
		name: "Networking 101",
		category: ProjectTypes.CLOUDINFRA,
		image: "/projects/networking.webp",
		blurImage: "/projects/networking.webp",
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
		blurImage: "/projects/stats_calc.webp",
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
		blurImage: "/projects/housing.webp",
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
		blurImage: "/projects/mktg_campaign.webp",
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
		blurImage: "/projects/easemytrip.webp",
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
		blurImage: "/projects/leetcode.webp",
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
		blurImage: "/projects/tensortonic.webp",
		description: "ML and deep learning fundamentals implemented from scratch — neural networks, loss functions, linear algebra, and statistics.",
		gradient: ["#1a1a2e", "#e94560"],
		url: "https://github.com/MarkPhamm/TensorTonic-Solutions",
		tech: ["python"],
	},
	// {
	// 	name: "Alcon Competitors Analysis",
	// 	category: ProjectTypes.STATISTICSML,
	// 	image: "/projects/alcon.webp",
	// 	blurImage: "/projects/alcon.webp",
	// 	description: "",
	// 	gradient: ["#167187", "#09091a"],
	// 	url: "https://github.com/MarkPhamm/Alcon-Financial-Assistant",
	// 	tech: ["python", "Pandas", "streamlit", "langchain", "openai"],
	// },
	// {
	// 	name: "Sample Sales Dashboard",
	// 	category: ProjectTypes.BIDASHBOARDVIZ,
	// 	image: "/projects/sample_sale.webp",
	// 	blurImage: "/projects/sample_sale.webp",
	// 	description: "",
	// 	gradient: ["#ffddaa", "#49789d"],
	// 	url: "https://public.tableau.com/app/profile/minh.pham1154/viz/GlobalSuperstoreSalesDashboard_16962776044380/SalesDashboard",
	// 	tech: ["excel", "alteryx", "tableau", "powerquery", "Microsoft SQL Server"],
	// },
	// {
	// 	name: "AdventureWorks Analytics",
	// 	category: ProjectTypes.ENDTOEND,
	// 	image: "/projects/adventurework.webp",
	// 	blurImage: "/projects/adventurework.webp",
	// 	description: "",
	// 	gradient: ["#003052", "#167187"],
	// 	url: "https://github.com/MarkPhamm/Adventureworks-Analytics",
	// 	tech: ["python", "Microsoft SQL Server", "PowerBI", "azure", "Git"],
	// },
	// {
	// 	name: "Segment Shopping Customers",
	// 	category: ProjectTypes.STATISTICSML,
	// 	image: "/projects/segment_shopping_cus.webp",
	// 	blurImage: "/projects/segment_shopping_cus.webp",
	// 	description: "",
	// 	gradient: ["#ccb08f", "#f2ece4"],
	// 	url: "https://github.com/MarkPhamm/Python-Segment-Shopping-Customers",
	// 	tech: ["python", "numpy", "Pandas", "Matplotlib", "Git"],
	// },
	// {
	// 	name: "EaseMyTrip Airline Dashboard",
	// 	category: ProjectTypes.BIDASHBOARDVIZ,
	// 	image: "/projects/easemytrip.webp",
	// 	blurImage: "/projects/easemytrip.webp",
	// 	description: "",
	// 	gradient: ["#167187", "#49789d"],
	// 	url: "https://mavenshowcase.com/project/19418",
	// 	tech: ["PowerBI", "alteryx", "excel", "powerquery", "Microsoft SQL Server"],
	// },
	// {
	// 	name: "United Ways Tax Advisor Chatbot",
	// 	category: ProjectTypes.STATISTICSML,
	// 	image: "/projects/comingsoon.webp",
	// 	blurImage: "/projects/comingsoon.webp",
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
		"Looker"
	],
	"Warehouse and Lakehouse": [
		"Snowflake",
		"AWS Redshift",
		"Databricks",
		"Apache Iceberg",
		"Delta Lake"
	],
	"Data Integration": [
		"Airbyte",
		"Dlt",
		"Fivetran",
		"stitch",
		"alteryx"
	],
	"Orchestration": [
		"Apache Airflow",
		"Dagster",
		"MageAI",
		"Orchestra",
		"Astronomer"
	],
	"Data Processing": [
		"dbt",
		"Trino",
		"Spark",
		"Hive",
		"Hadoop"
	],
	"Streaming": [
		"Kafka",
		"Flink",
		"Spark Streaming",
		"Kinesis Firehose",
		"PubSub"
	],
	"Cloud (AWS)": [
		"S3",
		"EC2",
		"Lambda",
		"MWAA",
		"VPC"
	],
	"DevOps": [
		"Docker",
		"Kubernetes",
		"Github",
		"Terraform",
		"AWS"
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

export const GTAG = "UA-163844688-1";
