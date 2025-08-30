import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Do not fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Do not fail the production build on TypeScript type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
