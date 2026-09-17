"use client";

import { cn } from "@/lib/cn";

type PrimaryButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  size?: "md" | "lg";
  type?: "button" | "submit" | "reset";
  href?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const sizeClasses = {
  md: "py-3.5 text-[14px]",
  lg: "py-4 text-[15px]",
};

export function PrimaryButton({
  children,
  className,
  disabled = false,
  loading = false,
  loadingLabel,
  fullWidth = true,
  size = "lg",
  type = "button",
  href,
  target,
  rel,
  onClick,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const label = loading ? (loadingLabel ?? children) : children;

  const classes = cn(
    "primary-button inline-flex items-center justify-center rounded-full bg-action text-center font-semibold text-white transition-[opacity,background-color] hover:bg-[#4A4DE0]",
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={cn(classes, isDisabled && "pointer-events-none opacity-45")}
        aria-disabled={isDisabled}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
      aria-busy={loading}
    >
      {label}
    </button>
  );
}
