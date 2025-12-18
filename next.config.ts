import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Specify the turbopack root to fix workspace detection issue
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
