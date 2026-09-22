import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN ?? "https://api.kailopay.com";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@dub/ui", "@dub/utils"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.dub.co" },
      { protocol: "https", hostname: "cryptologos.cc" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "assets.audd.digital" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "a.slack-edge.com" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/livez", destination: `${apiOrigin}/livez` },
        { source: "/readyz", destination: `${apiOrigin}/readyz` },
        { source: "/startupz", destination: `${apiOrigin}/startupz` },
      ],
    };
  },
};

export default nextConfig;
