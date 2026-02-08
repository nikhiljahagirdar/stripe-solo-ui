"use client";

import { Button as HeadlessButton } from "@headlessui/react";
import { motion } from "framer-motion";
import clsx from "clsx";
import React from "react";

type Variant =
  | "view"
  | "edit"
  | "delete"
  | "success"
  | "neutral";

type Style = "solid" | "outline" | "soft";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  readonly children?: React.ReactNode;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly iconOnly?: boolean;
  readonly ariaLabel?: string;

  readonly variant?: Variant;
  readonly style?: Style;
  readonly size?: Size;

  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly fullRounded?: boolean;
  readonly className?: string;

  readonly onClick?: () => void;
  readonly type?: "button" | "submit" | "reset";
}

/* ----------------------------------------
   Size config (button + icon auto sizing)
----------------------------------------- */
const sizeConfig: Record<
  Size,
  { btn: string; icon: string; square: string }
> = {
  sm: { btn: "px-3 py-1.5 text-sm", icon: "h-4 w-4", square: "h-8 w-8" },
  md: { btn: "px-4 py-2 text-sm", icon: "h-5 w-5", square: "h-9 w-9" },
  lg: { btn: "px-6 py-3 text-base", icon: "h-6 w-6", square: "h-11 w-11" },
};

/* ----------------------------------------
   Color system (Direct Tailwind classes)
----------------------------------------- */
const styles: Record<Variant, Record<Style, string>> = {
  view: {
    solid: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
    soft: "bg-blue-50 text-blue-500 hover:bg-blue-100",
  },
  edit: {
    solid: "bg-amber-500 text-white hover:bg-amber-600",
    outline: "border border-amber-500 text-amber-500 hover:bg-amber-50",
    soft: "bg-amber-50 text-amber-500 hover:bg-amber-100",
  },
  delete: {
    solid: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-red-500 text-red-500 hover:bg-red-50",
    soft: "bg-red-50 text-red-500 hover:bg-red-100",
  },
  success: {
    solid: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-green-500 text-green-500 hover:bg-green-50",
    soft: "bg-green-50 text-green-500 hover:bg-green-100",
  },
  neutral: {
    solid: "bg-gray-500 text-white hover:bg-gray-600",
    outline: "border border-gray-500 text-gray-500 hover:bg-gray-50",
    soft: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
};

export const Button = ({
  children,
  leftIcon,
  rightIcon,
  iconOnly = false,
  ariaLabel,

  variant = "neutral",
  style = "soft",
  size = "md",

  disabled = false,
  loading = false,
  fullRounded = false,
  className,

  onClick,
  type = "button",
}: ButtonProps) => {
  // Debug: Log the variant and style to see what's happening
  console.log('Button props:', { variant, style });
  
  // Safety check: ensure styles object exists and variant/style are valid
  const buttonStyles = styles?.[variant]?.[style] || styles?.neutral?.soft || 'bg-gray-100 text-gray-700';
  
  const cfg = sizeConfig[size];

  return (
    <HeadlessButton
      as={motion.button}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={iconOnly ? ariaLabel : undefined}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.04 }}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2",
        "overflow-hidden whitespace-nowrap font-medium",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        fullRounded ? "rounded-full" : "rounded-md",
        buttonStyles,
        iconOnly ? cfg.square : cfg.btn,
        className
      )}
    >
      {/* Ripple / gradient overlay */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Spinner */}
      {loading && (
        <span className={clsx("animate-spin rounded-full border-2 border-current border-t-transparent", cfg.icon)} />
      )}

      {/* Left Icon */}
      {!loading && leftIcon && (
        <span className={clsx("flex items-center justify-center", cfg.icon)}>
          {leftIcon}
        </span>
      )}

      {/* Text */}
      {!iconOnly && <span className="relative z-10">{children}</span>}

      {/* Right Icon */}
      {!loading && rightIcon && (
        <span className={clsx("flex items-center justify-center", cfg.icon)}>
          {rightIcon}
        </span>
      )}
    </HeadlessButton>
  );
};
