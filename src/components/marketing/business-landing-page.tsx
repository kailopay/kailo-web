import { ClosingCtaSection, FaqSection } from "./faq-section";
import { CoverageSection } from "./coverage-section";
import { DeveloperSection } from "./developer-section";
import { FasterPayoutsSection } from "./faster-payouts-section";
import { HeroSection } from "./hero-section";
import { PaymentMethodsSection } from "./payment-methods-section";
import { SecuritySection } from "./security-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { WhatYouCanBuildSection } from "./what-you-can-build-section";

export function BusinessLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink-body antialiased [text-wrap:pretty]">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-paper">
          <HeroSection />
          <PaymentMethodsSection />
          <WhatYouCanBuildSection />
          <FasterPayoutsSection />
          <DeveloperSection />
          <SecuritySection />
          <CoverageSection />
          <FaqSection />
          <ClosingCtaSection />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
