import Head from "next/head";
import { METADATA } from "../../constants";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Minh (Mark) Pham",
  url: METADATA.siteUrl,
  jobTitle: "Analytics Engineer",
  worksFor: { "@type": "Organization", name: "Insurify" },
  sameAs: [
    "https://www.linkedin.com/in/minhbphamm/",
    "https://github.com/MarkPhamm",
  ],
};

const PREVIEW_IMAGE = `${METADATA.siteUrl}/preview.jpg?v=2`;
const PREVIEW_ALT = "Mark Pham — Analytics Engineer bridging data and actionable insights";

interface LayoutProps {
  children: React.ReactNode;
  /** Per-page title; falls back to the site-wide default. */
  title?: string;
  /** Per-page description; falls back to the site-wide default. */
  description?: string;
  /** Route path ("/aboutme/reads") for canonical + og:url; defaults to home. */
  path?: string;
}

const Layout = ({ children, title, description, path }: LayoutProps) => {
  const pageTitle = title || METADATA.title;
  const pageDescription = description || METADATA.description;
  const pageUrl = `${METADATA.siteUrl}${path || ""}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content={METADATA.title} />
        <meta property="og:image" content={PREVIEW_IMAGE} />
        <meta property="og:image:secure_url" content={PREVIEW_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={PREVIEW_ALT} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={PREVIEW_IMAGE} />
        <meta name="twitter:image:alt" content={PREVIEW_ALT} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      {children}
    </>
  );
};

export default Layout;
