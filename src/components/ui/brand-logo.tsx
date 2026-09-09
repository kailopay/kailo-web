import Link from "next/link";

import { BRAND_NAME } from "@/content/landing";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${BRAND_NAME} home`}
      className={cn("flex flex-none items-center", className)}
    >
      <img
        src="/logo-full.png"
        alt={BRAND_NAME}
        className="block h-[38px] w-auto"
      />
    </Link>
  );
}
