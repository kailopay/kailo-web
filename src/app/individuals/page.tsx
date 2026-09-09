import type { Metadata } from "next";

import { IndividualsPage } from "@/components/individuals/individuals-page";
import { BRAND_NAME } from "@/content/landing";

const pageTitle = `Buy and Sell XLM & USDC | ${BRAND_NAME}`;
const pageDescription =
  "Buy and sell XLM and USDC with IDR on Stellar. Get a live quote before you continue.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
  },
  twitter: {
    title: pageTitle,
    description: pageDescription,
  },
};

export default function IndividualsRoute() {
  return <IndividualsPage />;
}
