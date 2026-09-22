import { DashboardChrome } from "@/components/dashboard/ui/layout/dashboard-chrome";
import { DashboardMainNav } from "@/components/dashboard/ui/layout/dashboard-main-nav";
import { MOCK_ORGANIZATION } from "@/lib/dashboard/mock/data";
import { mapKailopayUserToProfile } from "@/lib/kailopay/developer/profile";
import { getServerSession } from "@/lib/kailopay/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const FULLSCREEN_DASHBOARD_PATHS = [
  "/dashboard/payments/invoices/new",
  "/dashboard/payments/links/new",
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isFullscreen = FULLSCREEN_DASHBOARD_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const session = await getServerSession();
  if (!session?.email_verified) {
    redirect("/login?next=/dashboard");
  }

  const profile = mapKailopayUserToProfile(session);

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <DashboardMainNav
      user={{
        name: profile.name,
        email: profile.email,
        image: profile.image,
      }}
      organizations={[MOCK_ORGANIZATION]}
      initialActiveOrganization={MOCK_ORGANIZATION}
    >
      <DashboardChrome>{children}</DashboardChrome>
    </DashboardMainNav>
  );
}
