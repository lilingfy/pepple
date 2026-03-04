import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // External packages for server components (Drizzle ORM)
  serverExternalPackages: ["@neondatabase/serverless"],

  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
