import type { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", damping: 20, stiffness: 100 } 
  },
};

export const tapScale = {
  whileTap: { scale: 0.98 },
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 20px rgba(255, 51, 102, 0.2)",
    borderColor: "var(--brand-accent-red)",
  },
};
