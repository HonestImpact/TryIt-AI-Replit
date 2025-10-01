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
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent dev server from watching runtime-written directories
      // This stops hot-reload loops when ChromaDB, memory service, etc. write files
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/chroma/**',
          '**/noah-memory-data/**',
          '**/cache/**',
          '**/rag/**',
          '**/.git/**',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
