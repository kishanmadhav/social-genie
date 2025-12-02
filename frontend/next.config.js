/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'post-to-x-bucket.s3.eu-north-1.amazonaws.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
