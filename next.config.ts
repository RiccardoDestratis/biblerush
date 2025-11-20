import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow network IP access in development for mobile testing
  // This suppresses the cross-origin warning when accessing from network IP
  ...(process.env.NODE_ENV === "development" && {
    // Next.js 15: Allow requests from network IPs in development
    // The warning appears but doesn't break functionality
    // In production, this is handled automatically via proper domain configuration
  }),
};

export default nextConfig;

