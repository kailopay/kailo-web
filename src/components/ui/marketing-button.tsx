import Link from "next/link";

import { disabledMarketingLinkClass, isMarketingLinkEnabled } from "@/content/landing";
import { cn } from "@/lib/cn";

type MarketingButtonProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
};

const sizeClasses = {
  sm: "h-10 px-5 text-[14px]",
  md: "h-[50px] px-[26px] text-[14.5px]",
  lg: "h-[54px] px-[30px] text-[15px]",
};

export function MarketingButton({
  href,
  children,
  external = false,
  size = "sm",
  className,
  disabled = false,
}: MarketingButtonProps) {
  const classes = cn(
    "inline-flex items-center rounded-full bg-action font-semibold text-white transition-colors hover:bg-[#4A4DE0]",
    sizeClasses[size],
    className,
  );

  const isDisabled = disabled || !isMarketingLinkEnabled(href);

  if (isDisabled) {
    return (
      <span
        className={cn(classes, disabledMarketingLinkClass, "hover:bg-action")}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
