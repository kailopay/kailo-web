import { ClientOnly, Icon, useScrollProgress } from "@dub/ui";
import { cn } from "@dub/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CSSProperties, ReactNode, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/dashboard/shared/logo";
import { OrgDropdown } from "./org-dropdown";

export type NavItemCommon = {
  name: string;
  href: `/${string}`;
  exact?: boolean;
  isActive?: (pathname: string, href: string) => boolean;
  badge?: ReactNode;
  locked?: boolean;
};

export type NavItemType = NavItemCommon & {
  icon: Icon;
  submenuId?: string;
};

export type SidebarSubmenu = {
  id: string;
  title: string;
  backHref?: string;
  items: NavItemType[];
};

const SIDEBAR_WIDTH = 280;

export function SidebarNav({
  mainItems,
  submenus,
  activeSubmenu,
  bottom,
}: {
  mainItems: NavItemType[];
  submenus: Record<string, SidebarSubmenu>;
  activeSubmenu: string | null;
  bottom?: ReactNode;
}) {
  const activeSubmenuConfig = activeSubmenu ? submenus[activeSubmenu] : null;

  return (
    <div
      className="h-full w-[var(--sidebar-width)]"
      style={
        {
          "--sidebar-width": `${SIDEBAR_WIDTH}px`,
        } as CSSProperties
      }
    >
      <ClientOnly className="size-full">
        <nav className="flex size-full flex-col p-2">
          <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-primary text-primary-foreground">
            <div className="flex h-12 flex-shrink-0 items-center border-b border-white/10 px-4 sm:h-16">
              <Link
                href="/dashboard"
                className="block overflow-visible rounded-lg outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <Logo appearance="inverse" />
              </Link>
            </div>

            <SidebarPanel
              mainItems={mainItems}
              activeSubmenu={activeSubmenu}
              activeSubmenuConfig={activeSubmenuConfig}
              bottom={bottom}
            />

            <div className="flex-shrink-0 px-3 pb-3 pt-1">
              <OrgDropdown placement="sidebar-bottom" />
            </div>
          </div>
        </nav>
      </ClientOnly>
    </div>
  );
}

function SidebarPanel({
  mainItems,
  activeSubmenu,
  activeSubmenuConfig,
  bottom,
}: {
  mainItems: NavItemType[];
  activeSubmenu: string | null;
  activeSubmenuConfig: SidebarSubmenu | null;
  bottom?: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollProgress, updateScrollProgress } = useScrollProgress(scrollRef);

  const itemCount = activeSubmenuConfig
    ? activeSubmenuConfig.items.length
    : mainItems.length;
  const hasOverflow = itemCount > 10;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={updateScrollProgress}
          className={cn(
            "scrollbar-hide h-full overflow-x-hidden",
            hasOverflow ? "overflow-y-auto" : "overflow-hidden",
          )}
        >
          <div className="relative p-3 text-white/80">
            <div className="relative min-h-[12rem] w-full">
              <AnimatePresence mode="wait" initial={false}>
                {activeSubmenuConfig ? (
                  <motion.div
                    key={`submenu-${activeSubmenu}`}
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex flex-col"
                  >
                    <Link
                      href={activeSubmenuConfig.backHref ?? "/dashboard"}
                      className="group mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-lg bg-white/10 text-white",
                          "transition-[transform,background-color,color] duration-150 group-hover:-translate-x-0.5 group-hover:bg-white/20",
                        )}
                      >
                        <ChevronLeft className="size-3 [&_*]:stroke-2" />
                      </div>
                      <span className="text-lg font-semibold text-white">
                        {activeSubmenuConfig.title}
                      </span>
                    </Link>
                    <div className="flex flex-col gap-0.5">
                      {activeSubmenuConfig.items.map((item) => (
                        <NavItem key={item.name} item={item} />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="main-menu"
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex flex-col gap-0.5"
                  >
                    {mainItems.map((item) => (
                      <NavItem key={item.name} item={item} showSubmenuArrow />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {hasOverflow && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 z-10 h-16 w-full rounded-b-lg bg-gradient-to-t from-primary to-transparent"
            style={{ opacity: 1 - Math.pow(scrollProgress, 2) }}
          />
        )}
      </div>

      {bottom && <div className="flex flex-shrink-0 flex-col">{bottom}</div>}
    </div>
  );
}

function NavItem({
  item,
  showSubmenuArrow = false,
}: {
  item: NavItemType;
  showSubmenuArrow?: boolean;
}) {
  const { name, href, exact, isActive: customIsActive, locked, icon: ItemIcon, submenuId } =
    item;

  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  const isActive = useMemo(() => {
    if (customIsActive) {
      return customIsActive(pathname, href);
    }

    const hrefWithoutQuery = href.split("?")[0];
    return exact
      ? pathname === hrefWithoutQuery
      : pathname.startsWith(hrefWithoutQuery);
  }, [pathname, href, exact, customIsActive]);

  const hasSubmenu = showSubmenuArrow && Boolean(submenuId);

  return (
    <Link
      href={locked ? "#" : href}
      data-active={isActive}
      onPointerEnter={() => !locked && setHovered(true)}
      onPointerLeave={() => !locked && setHovered(false)}
      className={cn(
        "group flex h-9 items-center justify-between rounded-lg px-3 py-2 text-sm leading-none text-white/90 transition-[background-color,color,font-weight] duration-75",
        "outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        isActive
          ? "bg-white/15 font-medium text-white hover:bg-white/20 active:bg-white/25"
          : locked
            ? "cursor-not-allowed opacity-75"
            : "hover:bg-white/10 active:bg-white/15",
      )}
      aria-disabled={locked}
    >
      <span className="flex items-center gap-2.5">
        <ItemIcon
          data-hovered={hovered}
          className={cn("size-4 text-white/90", "group-data-[active=true]:text-white")}
        />
        {name}
      </span>
      <span className="ml-2 flex items-center gap-2">
        {item.badge && (
          <span
            className={cn(
              "flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold",
              isActive
                ? "bg-white text-primary"
                : "bg-white/15 text-white",
            )}
          >
            {item.badge}
          </span>
        )}
        {hasSubmenu && (
          <ChevronRight className="size-4 text-white/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white/90" />
        )}
      </span>
    </Link>
  );
}
