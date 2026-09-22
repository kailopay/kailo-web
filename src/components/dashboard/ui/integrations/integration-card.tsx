import Link from "next/link";
import { getIntegrationIconUrl } from "@/lib/dashboard/integrations/icons";
import type { IntegrationListItem } from "@/lib/dashboard/integrations/types";
import { IntegrationStatus } from "@/components/dashboard/ui/integrations/integration-status";

const cardClassName =
  "hover:drop-shadow-card-hover relative rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-[filter]";

export function IntegrationCard({ item }: { item: IntegrationListItem }) {
  const iconSrc = getIntegrationIconUrl(item.id);

  return (
    <Link href={item.href} className={cardClassName}>
      <div className="flex items-center gap-x-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white p-2">
          <img
            src={iconSrc}
            alt=""
            width={28}
            height={28}
            className="size-7 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-neutral-700">
              {item.name}
            </span>
            <IntegrationStatus integration={item.integration} />
          </div>
          <div className="truncate text-sm text-neutral-500">
            {item.description}
          </div>
        </div>
      </div>
    </Link>
  );
}
