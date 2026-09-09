import { cn } from "@/lib/cn";

type MarketingContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};

export function MarketingContainer({
  children,
  className,
  as = "div",
}: MarketingContainerProps) {
  const Component = as;

  return (
    <Component className={cn("mx-auto max-w-[1240px]", className)}>
      {children}
    </Component>
  );
}
