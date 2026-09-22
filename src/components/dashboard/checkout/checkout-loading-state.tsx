import { cn } from "@dub/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-200/60", className)} />;
}

export function CheckoutLoadingState() {
  return (
    <div className="relative min-h-svh bg-white @container">
      <div className="relative z-10 flex min-h-0 min-h-svh flex-col">
        <div className="flex min-h-0 min-h-svh flex-1 flex-col @lg:flex-row">
          {/* Order summary */}
          <div className="flex-none border-b border-neutral-200/60 bg-neutral-50 @lg:flex @lg:flex-1 @lg:justify-end @lg:border-b-0 @lg:border-r">
            <div className="mx-auto w-full max-w-sm px-6 pb-8 pt-8 text-left @lg:mx-0 @lg:ml-auto @lg:pb-10 @lg:pl-10 @lg:pr-20 @lg:pt-12">
              <SkeletonBlock className="h-12 w-48" />
              <SkeletonBlock className="mt-8 h-16 w-full" />
            </div>
          </div>

          {/* Payment panel */}
          <div className="relative flex min-h-0 flex-1 flex-col bg-white @lg:sticky @lg:top-0 @lg:max-h-svh">
            <div className="w-full max-w-md shrink-0 px-10 pt-8 @lg:mx-0 @lg:pl-20 @lg:pr-12">
              <SkeletonBlock className="h-5 w-24" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="w-full max-w-md px-10 pb-2 pt-4 @lg:mx-0 @lg:pl-20 @lg:pr-12">
                <SkeletonBlock className="aspect-square w-full rounded-lg" />
              </div>
            </div>

            <div className="w-full max-w-md shrink-0 px-10 pb-8 pt-6 @lg:mx-0 @lg:pl-20 @lg:pr-12">
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
