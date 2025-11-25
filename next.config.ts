import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow network IP access in development for mobile testing
  // This suppresses the cross-origin warning when accessing from network IP
  ...(process.env.NODE_ENV === "development" && {
      // Next.js 16: Allow requests from network IPs in development
    // The warning appears but doesn't break functionality
    // In production, this is handled automatically via proper domain configuration
  }),

  // Performance optimizations for dev server
  ...(process.env.NODE_ENV === "development" && {
    // Webpack config (used with --webpack flag to optimize file watching)
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Optimize file watching in development
        config.watchOptions = {
          poll: false, // Disable polling (use native file watching)
          ignored: [
            '**/node_modules/**',
            '**/.next/**',
            '**/.git/**',
            '**/test-results/**',
            '**/playwright-report/**',
            '**/e2e/**',
            '**/test-*.ts',
            '**/*.test.ts',
            '**/*.spec.ts',
            '**/migrations/**',
            '**/docs/**',
          ],
        };
      }
      return config;
    },
  }),

  // Image optimization configuration
  images: {
    // Allow images from Supabase Storage
    // Format: https://[PROJECT-ID].supabase.co/storage/v1/object/public/[bucket]/[path]
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Also allow direct Supabase URLs (for flexibility)
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Optimize images to modern formats (WebP, AVIF)
    formats: ["image/avif", "image/webp"],
    // Minimum cache time for optimized images (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;

