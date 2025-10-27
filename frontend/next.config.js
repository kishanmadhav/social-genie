/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net', // DALL-E images
      'post-to-x-bucket.s3.eu-north-1.amazonaws.com', // S3 bucket
      's3.eu-north-1.amazonaws.com', // S3 alternative domain
    ],
  },
}

module.exports = nextConfig
