import { DashboardContentErrorBoundary } from "@/components/dashboard/ui/layout/dashboard-content-error-boundary";
import { EnvironmentBanner } from "@/components/dashboard/ui/layout/environment-banner";
import { MainNav } from "@/components/dashboard/ui/layout/main-nav";
import { DashboardPageContent } from "@/components/dashboard/ui/layout/dashboard-page-content";
import { DashboardSidebarNav } from "@/components/dashboard/ui/layout/sidebar/dashboard-sidebar-nav";
import { UpgradeBanner } from "@/components/dashboard/ui/layout/upgrade-banner";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white">
      <EnvironmentBanner />
      <UpgradeBanner />
      <MainNav sidebar={DashboardSidebarNav}>
        <DashboardContentErrorBoundary>
          <DashboardPageContent>{children}</DashboardPageContent>
        </DashboardContentErrorBoundary>
      </MainNav>
    </div>
  );
}
