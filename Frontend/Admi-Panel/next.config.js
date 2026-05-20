/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'shopinverse.com',
      },
      {
        protocol: 'https',
        hostname: '**.shopinverse.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
      },
    ],
  },
  generateEtags: true,
  poweredByHeader: false,
};

module.exports = nextConfig
