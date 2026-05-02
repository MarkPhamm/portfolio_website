const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    loader: 'akamai',
    path: '/',
  },
  async redirects() {
    return [
      {
        source: '/myarticle/:path*',
        destination: 'https://substack.com/@markphammm',
        permanent: true,
      },
    ]
  },
})
