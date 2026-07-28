import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export is disabled to support Server Actions
  // For Firebase deployment, use Firebase Functions or Cloud Run
  turbopack: {
    // Prevent a parent-directory lockfile from being mistaken for this app's root.
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
