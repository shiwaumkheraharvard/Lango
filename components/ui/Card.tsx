"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ interactive, padded = true, className = "", children, ...rest }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2, boxShadow: "0 2px 4px rgba(26,26,26,0.05), 0 10px 24px rgba(26,26,26,0.08), 0 24px 56px rgba(232,93,4,0.10)" } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`card relative ${padded ? "p-5" : ""} ${interactive ? "cursor-pointer" : ""} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
