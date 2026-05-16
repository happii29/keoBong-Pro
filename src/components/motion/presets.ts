import type { Variants } from "framer-motion";

export const motionPresets = {
  fadeUp: {
    hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 },
  },
  slideFromBottom: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
} satisfies Record<string, Variants>;

export const motionTransition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
} as const;
