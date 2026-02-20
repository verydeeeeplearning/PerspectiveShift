"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedListItemProps {
  children: ReactNode;
  index: number;
}

export function AnimatedListItem({ children, index }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}
