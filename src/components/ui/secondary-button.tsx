"use client";

import { cn } from "@/lib/cn";

type SecondaryButtonProps = {
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
  md: "secondary-button--md",
  lg: "secondary-button--lg",
};

export function SecondaryButton({
  children,
  className,
  disabled = false,
  loading = false,
  loadingLabel,
  fullWidth = true,
  size = "md",
  type = "button",
  href,
  target,
  rel,
  onClick,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;
  const label = loading ? (loadingLabel ?? children) : children;

  const classes = cn(
    "secondary-button",
    sizeClasses[size],
    fullWidth && "secondary-button--full",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={cn(classes, isDisabled && "secondary-button--disabled")}
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
