"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { motionPresets, motionTransition } from "@/components/motion/presets";

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function FadeIn({ delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={motionPresets.fadeUp}
      transition={{ ...motionTransition, delay }}
      {...props}
    />
  );
}
