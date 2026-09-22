import { Geist, Geist_Mono } from "next/font/google";

import { DashboardProviders } from "@/components/dashboard/providers";

import "@/app/dashboard.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}>
      <DashboardProviders>{children}</DashboardProviders>
    </div>
  );
}
