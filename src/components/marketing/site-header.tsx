"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  audienceTabs,
  mainNavDropdowns,
  mainNavLinks,
  resourcesDropdown,
} from "@/content/landing";
import { cn } from "@/lib/cn";

import { BrandLogo } from "../ui/brand-logo";
import { MarketingButton } from "../ui/marketing-button";
import { MarketingNavLink } from "../ui/marketing-nav-link";
import { HamburgerIcon } from "../ui/icons";
import { NavDropdownMenu } from "../ui/nav-dropdown";

function MobileNavSection({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string; external?: boolean }>;
}) {
  return (
    <div className="py-2">
      <div className="py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted-light">
        {title}
      </div>
      {links.map((link) => (
        <MarketingNavLink
          key={link.label}
          link={link}
          className="block py-2 pl-3 text-sm font-medium text-ink-body"
        />
      ))}
    </div>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function isAudienceTabActive(href: string) {
    if (href === "/individuals") {
      return pathname === href || pathname.startsWith(`${href}/`);
    }

    if (href === "/") {
      if (pathname === "/") {
        return true;
      }
      if (pathname === "/login" || pathname === "/register") {
        return true;
      }
      return false;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink/[0.09] bg-paper/[0.88] backdrop-blur-[24px]">
      <div className="mx-auto flex max-w-[1240px] items-center gap-6 px-8 py-4">
        <BrandLogo />

        <div className="hidden flex-none items-center rounded-full bg-paper-warm-2 p-1 text-[13px] font-medium sm:flex">
          {audienceTabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={isAudienceTabActive(tab.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition-colors",
                isAudienceTabActive(tab.href)
                  ? "bg-white text-ink shadow-card-soft"
                  : "text-ink-body hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {mainNavDropdowns.map((dropdown) => (
            <NavDropdownMenu key={dropdown.label} dropdown={dropdown} />
          ))}
          {mainNavLinks.map((link) => (
            <MarketingNavLink
              key={link.label}
              link={link}
              className="text-ink-body transition-colors hover:text-ink"
            />
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-5 sm:flex">
          <div className="text-sm font-medium">
            <NavDropdownMenu dropdown={resourcesDropdown} />
          </div>
          <MarketingButton href="/register?next=/dashboard">
            Get Started
          </MarketingButton>
        </div>

        <button
          type="button"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-ink sm:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <HamburgerIcon className="icon h-6 w-6" />
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-ink/[0.09] px-8 py-4 sm:hidden">
          <div className="mb-3 flex items-center rounded-full bg-paper-warm-2 p-1 text-[13px] font-medium">
            {audienceTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={isAudienceTabActive(tab.href) ? "page" : undefined}
                className={cn(
                  "flex-1 rounded-full px-3.5 py-2 text-center transition-colors",
                  isAudienceTabActive(tab.href)
                    ? "bg-white text-ink shadow-card-soft"
                    : "text-ink-body",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {mainNavDropdowns.map((dropdown) => (
            <MobileNavSection
              key={dropdown.label}
              title={dropdown.label}
              links={dropdown.items}
            />
          ))}

          {mainNavLinks.map((link) => (
            <MarketingNavLink
              key={link.label}
              link={link}
              className="block py-2.5 text-sm font-medium text-ink-body"
            />
          ))}

          <MobileNavSection
            title={resourcesDropdown.label}
            links={resourcesDropdown.items}
          />

          <MarketingButton
            href="/register?next=/dashboard"
            className="mt-2 h-11 w-full justify-center"
          >
            Get Started
          </MarketingButton>
        </nav>
      )}
    </header>
  );
}
