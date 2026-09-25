import type { NavDropdown, NavLink } from "@/content/landing";
import { cn } from "@/lib/cn";

import { MarketingNavLink } from "./marketing-nav-link";
import { ChevronDownIcon } from "./icons";

type NavDropdownMenuProps = {
  dropdown: NavDropdown;
};

function NavLinkItem({ link }: { link: NavLink }) {
  const className =
    "block rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-ink-body transition-colors hover:bg-paper-warm hover:text-ink";

  return <MarketingNavLink link={link} className={className} />;
}

export function NavDropdownMenu({ dropdown }: NavDropdownMenuProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="text-ink-body flex items-center gap-1 transition-colors hover:text-ink group-hover:text-ink"
      >
        {dropdown.label}
        <ChevronDownIcon className="icon h-4 w-4 transition-transform duration-200 group-hover:-rotate-180" />
      </button>
      <div
        className={cn(
          "invisible absolute top-full z-30 translate-y-1 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
          dropdown.align === "right" ? "right-0" : "left-0",
        )}
      >
        <div
          className={cn(
            "rounded-2xl border border-ink/[0.08] bg-paper p-2 shadow-[0_20px_60px_rgba(13,27,42,.14)]",
            dropdown.align === "right" ? "min-w-[200px]" : "min-w-[220px]",
          )}
        >
          {dropdown.items.map((item) => (
            <NavLinkItem key={item.label} link={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
