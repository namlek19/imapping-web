import type { NextConfig } from "next";

const getBackendHostname = () => {
  const url = process.env.NEXT_PUBLIC_BE_BASE || process.env.BE_BASE || "https://api-imapping.coachcafe.shop";
  try {
    return new URL(url).hostname;
  } catch (e) {
    return "api-imapping.coachcafe.shop";
  }
};

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: getBackendHostname() },
    ],
  },
};

export default nextConfig;
