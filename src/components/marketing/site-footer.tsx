import Link from "next/link";

import { footerColumns, socialLinks } from "@/content/landing";

import { BrandLogo } from "../ui/brand-logo";

function SocialIcon({ icon }: { icon: (typeof socialLinks)[number]["icon"] }) {
  switch (icon) {
    case "x":
      return (
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      );
    case "instagram":
      return (
        <path
          d="M12 2.16c3.2 0 3.58.01 4.85.07 1.36.06 2.63.34 3.6 1.31.98.98 1.25 2.24 1.31 3.61.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.37-.33 2.63-1.31 3.61-.97.97-2.24 1.25-3.6 1.31-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.37-.06-2.63-.34-3.61-1.31-.97-.98-1.25-2.24-1.31-3.61C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.06-1.37.34-2.63 1.31-3.61.98-.97 2.24-1.25 3.61-1.31C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.5.02-4.74.07-.94.05-1.75.19-2.32.76-.57.57-.72 1.38-.76 2.32-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.4.94.19 1.75.76 2.32.57.57 1.38.72 2.32.76 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.94-.04 1.75-.19 2.32-.76.57-.57.72-1.38.76-2.32.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.94-.19-1.75-.76-2.32-.57-.57-1.38-.71-2.32-.76-1.24-.05-1.59-.07-4.74-.07zm0 3.07a4.97 4.97 0 110 9.94 4.97 4.97 0 010-9.94zm0 1.8a3.17 3.17 0 100 6.34 3.17 3.17 0 000-6.34zm6.41-2a1.16 1.16 0 11-2.33 0 1.16 1.16 0 012.33 0z"
        />
      );
    case "tiktok":
      return (
        <path
          d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 11-1.81-2.47V9.79a5.68 5.68 0 105.68 5.68V9.4a7.35 7.35 0 004.31 1.38V7.7a4.3 4.3 0 01-3.03-1.88z"
        />
      );
    case "linkedin":
      return (
        <path
          d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.94v5.66H9.36V9h3.41v1.56h.05a3.74 3.74 0 013.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z"
        />
      );
    case "facebook":
      return (
        <path
          d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94z"
        />
      );
  }
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-ground-deep px-8 pb-11 pt-[60px]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap gap-14">
        <div className="min-w-[200px] flex-[1_1_220px]">
          <BrandLogo variant="light" className="mb-4" />
          <p className="mb-[22px] max-w-[30ch] text-[12.5px] leading-[1.7] text-ink-muted">
            Indonesia-first on-ramp and off-ramp infrastructure for Stellar
          </p>
          <div className="flex flex-wrap gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener"
                aria-label={social.label}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/[0.06] text-ink-muted transition-colors hover:bg-white/[0.13] hover:text-white"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <SocialIcon icon={social.icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="grid flex-[2_1_480px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-8">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {column.title}
              </div>
              <div className="flex flex-col gap-[11px] text-[13px]">
                {column.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener"
                      className="text-ink-footer transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-ink-footer transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-11 max-w-[1240px] border-t border-white/[0.07] pt-[26px]">
        <p className="m-0 text-[11.5px] leading-[1.8] text-[#4E5A6B]">
          © 2026 kailopay.com
        </p>
      </div>
    </footer>
  );
}
