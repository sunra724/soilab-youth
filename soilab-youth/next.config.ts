import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: '/csr',
        destination: 'https://csr.soilab-youth.kr',
        permanent: true,
      },
      {
        source: '/csr/:path*',
        destination: 'https://csr.soilab-youth.kr/:path*',
        permanent: true,
      },
      {
        source: '/morning/:path*',
        destination: 'https://csr.soilab-youth.kr/morning/:path*',
        permanent: true,
      },
      {
        source: '/impact/:path*',
        destination: 'https://csr.soilab-youth.kr/impact/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.notion.so" },
      { protocol: "https", hostname: "notion.so" },
      { protocol: "https", hostname: "s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "prod-files-secure.s3.us-west-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
