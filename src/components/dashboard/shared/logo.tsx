import Image from "next/image";
import { cn } from "@/lib/dashboard/utils";

const LOGO_HEIGHT = 32;
const LOGO_WIDTH = Math.round((LOGO_HEIGHT * 2294) / 848);

const LOGO_SRC = {
  default: "/logo-full.png",
  inverse: "/logo-dark.png",
} as const;

export function Logo({
  appearance = "default",
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof Image>, "src" | "alt" | "width" | "height"> & {
  appearance?: keyof typeof LOGO_SRC;
}) {
  return (
    <Image
      src={LOGO_SRC[appearance]}
      alt="KailoPay"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      className={cn("h-8 w-auto object-contain", className)}
      {...props}
    />
  );
}
