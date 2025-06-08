/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    API_URL: process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:3000/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-api-url.com/api/:path*' // Replace with your production API URL
          : 'http://localhost:3000/api/:path*',
      },
    ];
  },
  // Enable static exports for the app to be deployed with `next export`
  output: 'standalone',
  // Enable trailing slashes for better compatibility with Vercel
  trailingSlash: true,
};

module.exports = nextConfig;