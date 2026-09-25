import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleUser,
  KeyRound,
  LayoutDashboard,
  ListOrdered,
  RefreshCw,
  Wallet,
  Webhook,
} from "lucide-react";
import type { Organization } from "@/lib/dashboard/db/schema";

export type DashboardNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const dashboardNav: DashboardNavItem[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: "/dashboard/developers/orders",
    icon: ListOrdered,
  },
  {
    title: "Revenue",
    url: "/dashboard/developers/revenue",
    icon: RefreshCw,
  },
  {
    title: "API Keys",
    url: "/dashboard/developers/api-keys",
    icon: KeyRound,
  },
  {
    title: "Wallets",
    url: "/dashboard/developers/wallets",
    icon: Wallet,
  },
  {
    title: "Webhooks",
    url: "/dashboard/developers/webhooks",
    icon: Webhook,
  },
  {
    title: "Documentation",
    url: "/dashboard/developers/documentation",
    icon: BookOpen,
  },
  {
    title: "Profile",
    url: "/dashboard/settings/profile",
    icon: CircleUser,
  },
];

export function getSettingsNavItems(_environment: Organization["environment"]) {
  return dashboardNav.filter((item) => item.url.startsWith("/dashboard/settings"));
}

export function getDashboardNav(_environment: Organization["environment"]) {
  return dashboardNav;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/developers": "Overview",
  "/dashboard/developers/orders": "Orders",
  "/dashboard/developers/revenue": "Revenue",
  "/dashboard/developers/wallets": "Wallets",
  "/dashboard/developers/api-keys": "API Keys",
  "/dashboard/developers/webhooks": "Webhooks",
  "/dashboard/developers/documentation": "Documentation",
  "/dashboard/settings/profile": "Profile",
};

export function getDashboardPageTitle(pathname: string) {
  if (
    pathname.startsWith("/dashboard/developers/api-keys/") &&
    pathname !== "/dashboard/developers/api-keys"
  ) {
    return "API Key Detail";
  }

  if (
    pathname.startsWith("/dashboard/developers/webhooks/") &&
    pathname !== "/dashboard/developers/webhooks"
  ) {
    return pathname.endsWith("/edit") ? "Webhook Configuration" : "Webhook Detail";
  }

  return pageTitles[pathname] ?? "Dashboard";
}

export function isNavItemActive(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/developers";
  }

  if (url === "/dashboard/developers/api-keys") {
    return pathname === url || pathname.startsWith("/dashboard/developers/api-keys/");
  }

  if (url === "/dashboard/developers/webhooks") {
    return pathname === url || pathname.startsWith("/dashboard/developers/webhooks/");
  }

  if (url === "/dashboard/settings/profile") {
    return pathname === url || pathname.startsWith("/dashboard/settings/profile/");
  }

  return pathname === url;
}

export function isNavGroupActive(pathname: string, item: DashboardNavItem) {
  return isNavItemActive(pathname, item.url);
}
