import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN ?? "https://api.kailopay.com";

const backendAuthPaths = [
  "/auth/register",
  "/auth/login",
  "/auth/logout",
  "/auth/email/verify",
  "/auth/email/resend",
  "/auth/password/forgot",
  "/auth/password/reset",
  "/auth/password/change",
  "/auth/google/login",
  "/auth/google/callback",
  "/auth/me",
  "/auth/me/avatar",
] as const;

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return {
      beforeFiles: [
        ...backendAuthPaths.map((path) => ({
          source: path,
          destination: `${apiOrigin}${path}`,
        })),
        { source: "/v1/:path*", destination: `${apiOrigin}/v1/:path*` },
        { source: "/livez", destination: `${apiOrigin}/livez` },
        { source: "/readyz", destination: `${apiOrigin}/readyz` },
        { source: "/startupz", destination: `${apiOrigin}/startupz` },
      ],
    };
  },
};

export default nextConfig;
