"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  /** "up" slides in, "wipe" reveals like a broadcast lower-third. */
  variant?: "up" | "wipe";
  className?: string;
}

const wipeParent: Variants = {
  hidden: { opacity: 0.001 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

const wipeChild = (delay: number): Variants => ({
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

export default function Reveal({
  children,
  delay = 0,
  y = 24,
  variant = "up",
  className,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (variant === "wipe") {
    return (
      <motion.div
        className={className}
        initial={reduce ? "visible" : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, margin: "-60px" }}
        variants={wipeParent}
      >
        <motion.div variants={wipeChild(delay)}>{children}</motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
