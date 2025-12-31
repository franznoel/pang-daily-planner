import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set output to 'standalone' to prevent static export
  // This is required because we use client components with React Context
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
