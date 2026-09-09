import { SiteFooter } from "../marketing/site-footer";
import { SiteHeader } from "../marketing/site-header";
import { RampWidget } from "./ramp-widget";

export function IndividualsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink-body antialiased [text-wrap:pretty]">
      <SiteHeader />
      <main className="individuals-ramp-main">
        <RampWidget />
      </main>
      <SiteFooter />
    </div>
  );
}
