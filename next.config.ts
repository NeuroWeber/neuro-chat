import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack:{},
  cacheComponents:true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
         protocol: "https",
         hostname: "cdn-icons-png.flaticon.com",
      },
    ],
  },
};

export default nextConfig;
