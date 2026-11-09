import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared, lightweight motion primitives. All honour prefers-reduced-motion. */

const EASE = [0.22, 1, 0.36, 1] as const;

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the reveal starts. */
  delay?: number;
  /** Vertical slide distance in px. */
  y?: number;
  /** Horizontal slide distance in px. */
  x?: number;
  once?: boolean;
};

/** Fades and slides its content up when it scrolls into view. */
export function FadeIn({ children, className, delay = 0, y = 18, x = 0, once = true }: FadeInProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.58, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Plays once on mount (for above-the-fold content such as heroes). */
export function FadeInOnMount({ children, className, delay = 0, y = 18 }: Omit<FadeInProps, "once" | "x">) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/** Parent wrapper: staggers its StaggerItem children when scrolled into view. */
export function Stagger({ children, className, once = true }: { children: ReactNode; className?: string; once?: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={cn(className)} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/** Native list version of Stagger, preserving list semantics for repeated cards. */
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <ul className={className}>{children}</ul>;
  return (
    <motion.ul
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.ul>
  );
}

export function StaggerListItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <li className={className}>{children}</li>;
  return (
    <motion.li className={cn(className)} variants={staggerItem}>
      {children}
    </motion.li>
  );
}

/** Subtle lift on hover for cards. */
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}

type CounterProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

/** Counts up from zero when it scrolls into view. */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => (0).toFixed(decimals));

  useEffect(() => {
    if (reduce) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {reduce ? value.toFixed(decimals) : display}
      {suffix}
    </span>
  );
}

/** Grows a thin rule outwards when in view — used under headings. */
export function GrowRule({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={cn("h-px w-24 gold-rule", className)} aria-hidden="true" />;
  return (
    <motion.div
      className={cn("h-px gold-rule", className)}
      aria-hidden="true"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ transformOrigin: "center" }}
    />
  );
}
