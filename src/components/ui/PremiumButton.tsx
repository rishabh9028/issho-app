"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "glass" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export const PremiumButton = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  ...props
}: PremiumButtonProps) => {
  const variants = {
    primary: "bg-brand-gradient text-white shadow-premium hover:shadow-premium-hover",
    secondary: "bg-white text-primary shadow-sm hover:shadow-md border border-slate-100",
    glass: "glass text-slate-900 hover:bg-white/90",
    outline: "bg-transparent border-2 border-white/20 text-white hover:bg-white/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-2xl font-bold tracking-tight transition-all flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
