import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Official supplier/brand sites — added one at a time as real product
      // photos are sourced per docs/ATTRIBUTES_ANALYSIS.md's 41-brand list.
      {
        protocol: "https",
        hostname: "www.adalyatobacco.com",
      },
      // Photos uploaded through the admin (lounge page) — see components/ui/UploadedImage.tsx
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
