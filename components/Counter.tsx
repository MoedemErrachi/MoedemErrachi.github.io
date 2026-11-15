"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

interface CounterProps {
  value: number;
  /** Zero-pad the rendered number, e.g. pad 2 → "02". */
  pad?: number;
  duration?: number;
  className?: string;
}

export default function Counter({
  value,
  pad,
  duration = 1.2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const text = useTransform(progress, (latest) =>
    String(Math.round(latest)).padStart(pad ?? 0, "0"),
  );

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      progress.set(value);
      return;
    }
    const controls = animate(progress, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, value, duration, reduce, progress]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
