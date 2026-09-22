import { Archivo } from "next/font/google";

import { GoogleAuthPopupRoot } from "@/components/auth/google-auth-popup-root";

import "../globals.css";
import "../marketing/styles.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={archivo.variable}>
      <GoogleAuthPopupRoot>{children}</GoogleAuthPopupRoot>
    </div>
  );
}
