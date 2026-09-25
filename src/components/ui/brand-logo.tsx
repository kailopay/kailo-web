import Link from "next/link";

import { BRAND_NAME } from "@/content/landing";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function BrandLogo({ variant = "dark", className }: BrandLogoProps) {
  const src = variant === "light" ? "/logo-dark.png" : "/logo-full.png";

  return (
    <Link
      href="/"
      aria-label={`${BRAND_NAME} home`}
      className={cn("flex flex-none items-center", className)}
    >
      <img src={src} alt={BRAND_NAME} className="block h-[38px] w-auto" />
    </Link>
  );
}
