import type { Metadata } from "next";
import { Suspense } from "react";

import { NProgressBar } from "@/components/navigation/nprogress-bar";
import { BRAND_NAME } from "@/content/landing";

import "./nprogress.css";

const pageTitle = `IDR On-Ramp and Off-Ramp for Stellar | ${BRAND_NAME}`;
const pageDescription =
  "Indonesia-first sandbox on-ramp and off-ramp for Stellar. Buy XLM with IDR or sell XLM back to Rupiah using QRIS, bank transfer, and e-wallets through one API.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: BRAND_NAME,
    title: pageTitle,
    description: pageDescription,
    type: "website",
    url: "https://kailopay.com",
    images: [
      {
        url: "/marketing/og-business.png",
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME}: Indonesia-first on-ramp and off-ramp for Stellar`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kailopay",
    title: pageTitle,
    description: pageDescription,
    images: ["/marketing/og-business.png"],
  },
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: "default",
  },
  other: {
    "msapplication-TileColor": "#da532c",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&display=swap"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      </head>
      <body>
        <Suspense fallback={null}>
          <NProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
