// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="description" content={METADATA.description} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={METADATA.title} />
        <meta property="og:description" content={METADATA.description} />
        <meta property="og:url" content={METADATA.siteUrl} />
        <meta property="og:site_name" content={METADATA.title} />
        <meta property="og:image" content={PREVIEW_IMAGE} />
        <meta property="og:image:secure_url" content={PREVIEW_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={PREVIEW_ALT} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={METADATA.title} />
        <meta name="twitter:description" content={METADATA.description} />
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
