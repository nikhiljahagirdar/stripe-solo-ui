import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  cacheComponents: false,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  async redirects() {
    return [
      {
        source: '/admin/analytics',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
