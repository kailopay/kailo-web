import Link from "next/link";

import type { NavLink } from "@/content/landing";
import { disabledMarketingLinkClass, isMarketingLinkEnabled } from "@/content/landing";
import { cn } from "@/lib/cn";

type MarketingNavLinkProps = {
  link: NavLink;
  className?: string;
  children?: React.ReactNode;
};

export function MarketingNavLink({ link, className, children }: MarketingNavLinkProps) {
  const label = children ?? link.label;
  const enabled = isMarketingLinkEnabled(link.href);

  if (!enabled) {
    return (
      <span className={cn(className, disabledMarketingLinkClass)} aria-disabled="true">
        {label}
      </span>
    );
  }

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener"
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {label}
    </Link>
  );
}
