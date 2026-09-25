"use client";

import {
  consumePendingDashboardScrollTop,
  DUB_DASHBOARD_MAIN_SCROLL_ID,
  useMediaQuery,
} from "@dub/ui";
import { cn } from "@dub/utils";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ComponentType,
  createContext,
  CSSProperties,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useDashboardTopBannerHeight } from "./environment-banner";

type SideNavContext = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const SideNavContext = createContext<SideNavContext>({
  isOpen: false,
  setIsOpen: () => {},
});

function MainNavScrollRestoration() {
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    const top = consumePendingDashboardScrollTop();
    if (top === null) return;
    const el = document.getElementById(DUB_DASHBOARD_MAIN_SCROLL_ID);
    if (!el) return;
    const apply = () => {
      el.scrollTop = top;
    };
    apply();
    requestAnimationFrame(() => {
      requestAnimationFrame(apply);
    });
  }, [searchParams.toString()]);

  return null;
}

export function MainNav({
  children,
  sidebar: Sidebar,
}: PropsWithChildren<{
  sidebar: ComponentType;
}>) {
  const pathname = usePathname();

  const { isDesktop } = useMediaQuery();
  const [isOpen, setIsOpen] = useState(false);
  const { height: topBannerHeight, hasTopBanner } = useDashboardTopBannerHeight();

  // Prevent body scroll when side nav is open
  useEffect(() => {
    document.body.style.overflow = isOpen && !isDesktop ? "hidden" : "auto";
  }, [isOpen, isDesktop]);

  // Close side nav when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div
      className="min-h-screen w-full lg:grid lg:grid-cols-[min-content_minmax(0,1fr)]"
      style={
        hasTopBanner
          ? ({
              "--dashboard-top-banner-height": `${topBannerHeight}px`,
            } as CSSProperties)
          : undefined
      }
    >
      <Suspense fallback={null}>
        <MainNavScrollRestoration />
      </Suspense>

      {/* Desktop sidebar — always in grid column 1, full viewport height */}
      <div
        className={cn(
          "hidden lg:sticky lg:top-0 lg:col-start-1 lg:block lg:h-dvh lg:w-full lg:shrink-0",
          hasTopBanner &&
            "lg:h-[calc(100dvh-var(--dashboard-top-banner-height))] lg:top-[var(--dashboard-top-banner-height)]",
        )}
      >
        <div className="h-full w-min max-w-full bg-primary">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen ? (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden",
            hasTopBanner && "top-[var(--dashboard-top-banner-height)]",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setIsOpen(false);
            }
          }}
        >
          <div
            className={cn(
              "relative h-full w-min max-w-[85vw] bg-primary",
              hasTopBanner
                ? "h-[calc(100dvh-var(--dashboard-top-banner-height))]"
                : "h-dvh",
            )}
          >
            <Sidebar />
          </div>
        </div>
      ) : null}

      {/* Main content — grid column 2 on desktop, full width on mobile */}
      <div
        className={cn(
          "min-w-0 w-full lg:col-start-2",
          "bg-neutral-200 pb-[var(--page-bottom-margin)] pt-[var(--page-top-margin)] [--page-bottom-margin:0px] [--page-top-margin:0px] lg:pb-2 lg:pr-2 lg:[--page-bottom-margin:0.5rem] lg:[--page-top-margin:0.5rem]",
          hasTopBanner
            ? "h-[calc(100vh-var(--dashboard-top-banner-height))]"
            : "min-h-dvh h-dvh",
          hasTopBanner && "mt-[var(--dashboard-top-banner-height)]",
        )}
      >
        <div
          id={DUB_DASHBOARD_MAIN_SCROLL_ID}
          className="relative h-full overflow-y-auto bg-neutral-100 pt-px lg:rounded-xl lg:bg-white"
        >
          <SideNavContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
          </SideNavContext.Provider>
        </div>
      </div>
    </div>
  );
}
