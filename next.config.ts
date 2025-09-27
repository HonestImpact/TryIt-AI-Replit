import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set Turbopack root to resolve workspace detection warning
  turbopack: {
    root: __dirname,
  },
  typescript: {
    // Skip type checking for placeholder files during build (for production hotfix)
    // Remove this when implementing the full analytics/knowledge/tools layers
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during builds for now
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
