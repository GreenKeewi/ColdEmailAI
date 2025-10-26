/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['localhost:3000', 'solitary-cobweb-4j76j6qvx7r7fqgww-3000.app.github.dev'],
    },
  },
};

module.exports = nextConfig;
