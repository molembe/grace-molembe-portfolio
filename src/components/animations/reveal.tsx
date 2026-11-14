"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps } from "react";

/** Apparition douce au scroll (fade + montée 12px), désactivée si reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  ...props
}: ComponentProps<typeof motion.div> & { delay?: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
