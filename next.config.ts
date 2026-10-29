import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ahoi-production-bucket-public.s3.eu-central-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;