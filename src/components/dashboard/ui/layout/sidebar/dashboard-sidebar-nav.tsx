"use client";

import { isNavItemActive } from "@/lib/dashboard/navigation/dashboard-nav";
import {
  ArrowsOppositeDirectionX,
  BookOpen,
  Code,
  Gauge6,
  InvoiceDollar,
  Key,
  MoneyBill2,
  Refresh2,
  User,
  Webhook,
} from "./icons";
import { NavItemType, SidebarNav, SidebarSubmenu } from "./sidebar-nav";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const DEVELOPERS_SUBMENU_ID = "developers";

const DEVELOPERS_SUBMENU_PATHS = [
  "/dashboard/developers/api-keys",
  "/dashboard/developers/wallets",
  "/dashboard/developers/webhooks",
  "/dashboard/developers/documentation",
] as const;

function isDevelopersSubmenuPath(pathname: string) {
  return DEVELOPERS_SUBMENU_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function resolveActiveSubmenu(pathname: string): string | null {
  if (isDevelopersSubmenuPath(pathname)) {
    return DEVELOPERS_SUBMENU_ID;
  }

  return null;
}

function getDevelopersSubmenu(): SidebarSubmenu {
  return {
    id: DEVELOPERS_SUBMENU_ID,
    title: "Developers",
    backHref: "/dashboard",
    items: [
      {
        name: "API Keys",
        icon: Key,
        href: "/dashboard/developers/api-keys",
        isActive: (pathname, href) => isNavItemActive(pathname, href),
      },
      {
        name: "Wallets",
        icon: MoneyBill2,
        href: "/dashboard/developers/wallets",
        isActive: (pathname, href) => isNavItemActive(pathname, href),
      },
      {
        name: "Webhooks",
        icon: Webhook,
        href: "/dashboard/developers/webhooks",
        isActive: (pathname, href) => isNavItemActive(pathname, href),
      },
      {
        name: "Documentation",
        icon: BookOpen,
        href: "/dashboard/developers/documentation",
        isActive: (pathname, href) => isNavItemActive(pathname, href),
      },
    ],
  };
}

function getMainNavItems(): NavItemType[] {
  return [
    {
      name: "Overview",
      icon: Gauge6,
      href: "/dashboard",
      isActive: (pathname, href) => isNavItemActive(pathname, href),
    },
    {
      name: "Analytics",
      icon: Refresh2,
      href: "/dashboard/developers/analytics",
      isActive: (pathname, href) => isNavItemActive(pathname, href),
    },
    {
      name: "Orders",
      icon: ArrowsOppositeDirectionX,
      href: "/dashboard/developers/orders",
      isActive: (pathname, href) => isNavItemActive(pathname, href),
    },
    {
      name: "Revenue",
      icon: InvoiceDollar,
      href: "/dashboard/developers/revenue",
      isActive: (pathname, href) => isNavItemActive(pathname, href),
    },
    {
      name: "Developers",
      icon: Code,
      href: "/dashboard/developers/api-keys",
      submenuId: DEVELOPERS_SUBMENU_ID,
      isActive: (pathname) => isDevelopersSubmenuPath(pathname),
    },
    {
      name: "Profile",
      icon: User,
      href: "/dashboard/settings/profile",
      isActive: (pathname, href) => isNavItemActive(pathname, href),
    },
  ];
}

export function DashboardSidebarNav() {
  const pathname = usePathname();
  const activeSubmenu = useMemo(() => resolveActiveSubmenu(pathname), [pathname]);

  return (
    <SidebarNav
      mainItems={getMainNavItems()}
      submenus={{
        [DEVELOPERS_SUBMENU_ID]: getDevelopersSubmenu(),
      }}
      activeSubmenu={activeSubmenu}
    />
  );
}
