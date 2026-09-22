import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

type AuthPageShellProps = {
  children: React.ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink-body antialiased [text-wrap:pretty]">
      <SiteHeader />
      <main className="individuals-ramp-main">
        <div className="w-full max-w-md px-4 sm:px-0">
          <div className="ramp-widget-card">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
