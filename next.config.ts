import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export is disabled to support Server Actions
  // For Firebase deployment, use Firebase Functions or Cloud Run
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
