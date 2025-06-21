import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'amxpepbh5zcevkee.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
