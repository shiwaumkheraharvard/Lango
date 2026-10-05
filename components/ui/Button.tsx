"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-orange-deep text-white shadow-orange hover:bg-[#d95500] font-bold",
  secondary: "bg-orange-soft text-ink hover:bg-[#ffe6d3] font-semibold",
  ghost: "bg-transparent text-ink hover:bg-orange-soft/70 font-semibold",
  dark: "bg-ink text-white hover:bg-black font-semibold",
  danger: "bg-[#FDECEC] text-[#B42318] hover:bg-[#fbdede] font-semibold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-[15px] rounded-xl gap-2",
  lg: "h-13 px-6 text-[17px] rounded-2xl gap-2",
  xl: "h-14 px-7 text-lg rounded-2xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", full, className = "", children, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap select-none transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
