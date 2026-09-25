"use client";

import { useDashboardShell } from "@/components/dashboard/ui/layout/dashboard-shell-context";
import { Avatar, Popover } from "@dub/ui";
import { cn } from "@dub/utils";
import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import Link from "next/link";
import { signOutAndRedirect } from "@/lib/kailopay/auth";
import { useState } from "react";

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function getUserDisplayName(user: DashboardUser) {
  return user.name?.trim() || user.email?.split("@")[0] || "User";
}

function UserProfileMark({ user, className }: { user: DashboardUser; className?: string }) {
  return (
    <Avatar
      imageUrl={user.image}
      identifier={user.email ?? user.name ?? "user"}
      className={className}
    />
  );
}

export function OrgDropdown({ placement = "switcher" }: { placement?: "switcher" | "sidebar-bottom" }) {
  const { activeOrganization, user } = useDashboardShell();
  const [openPopover, setOpenPopover] = useState(false);

  if (!activeOrganization) {
    return <OrgDropdownPlaceholder placement={placement} />;
  }

  const isSidebarBottom = placement === "sidebar-bottom";

  return (
    <div className={cn(isSidebarBottom && "w-full")}>
      <Popover
        content={
          <OrgList user={user} setOpenPopover={setOpenPopover} />
        }
        side={isSidebarBottom ? "top" : "right"}
        align="start"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        {isSidebarBottom ? (
          <button
            type="button"
            onClick={() => setOpenPopover(!openPopover)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-white transition-all duration-75",
              "hover:bg-white/10 active:bg-white/15 data-[state=open]:bg-white/15",
              "outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            )}
          >
            <div className="flex size-8 shrink-0 overflow-hidden rounded-full">
              <UserProfileMark user={user} className="size-full" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate font-medium text-white">{getUserDisplayName(user)}</div>
              <div className="truncate text-xs text-white/70">{user.email}</div>
            </div>
            <ChevronDown className="size-4 shrink-0 text-white/70" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpenPopover(!openPopover)}
            className={cn(
              "flex size-11 items-center justify-center rounded-lg p-1.5 text-left text-sm transition-all duration-75",
              "hover:bg-bg-inverted/5 active:bg-bg-inverted/10 data-[state=open]:bg-bg-inverted/10",
              "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            )}
          >
            <div className="flex size-7 overflow-hidden rounded-full">
              <UserProfileMark user={user} className="size-full" />
            </div>
          </button>
        )}
      </Popover>
    </div>
  );
}

function OrgDropdownPlaceholder({ placement = "switcher" }: { placement?: "switcher" | "sidebar-bottom" }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/20",
        placement === "sidebar-bottom" ? "h-12 w-full" : "size-11",
      )}
    />
  );
}

function OrgList({
  user,
  setOpenPopover,
}: {
  user: DashboardUser;
  setOpenPopover: (open: boolean) => void;
}) {
  return (
    <div className="w-72 rounded-xl bg-white text-sm">
      <div className="border-b border-neutral-200 px-3 py-3">
        <div className="flex items-center gap-x-2.5 text-left">
          <div className="flex size-8 shrink-0 overflow-hidden rounded-full">
            <UserProfileMark user={user} className="size-full" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-neutral-900">{getUserDisplayName(user)}</div>
            <div className="truncate text-xs text-neutral-500">{user.email}</div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-0.5">
          <Link
            href="/dashboard/settings/profile"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-neutral-700 outline-none transition-all duration-75 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary/50"
            onClick={() => setOpenPopover(false)}
          >
            <CircleUser className="size-4 shrink-0 text-neutral-800" />
            <span className="text-sm">Profile</span>
          </Link>
        </div>
      </div>

      <div className="p-1.5">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-neutral-700 transition-all duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80"
          onClick={() => {
            setOpenPopover(false);
            void signOutAndRedirect("/login?next=/dashboard");
          }}
        >
          <LogOut className="size-4 shrink-0 text-neutral-500" />
          <span className="text-sm">Log out</span>
        </button>
      </div>
    </div>
  );
}
