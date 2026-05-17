"use client";

import { Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type MVPBadgeProps = {
  rank: number;
  mvp: number;
  className?: string;
};

export function MVPBadge({ rank, mvp, className }: MVPBadgeProps) {
  const Icon = rank === 1 ? Crown : Medal;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold shadow-luxury",
        rank === 1 && "border-gold/45 bg-gold/18 text-gold",
        rank === 2 && "border-slate-200/30 bg-white/12 text-slate-100",
        rank === 3 && "border-orange-300/35 bg-orange-400/14 text-orange-200",
        rank > 3 && "border-white/12 bg-white/[0.055] text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {rank <= 3 ? `Top ${rank}` : `#${rank}`}
      <span className="text-foreground/80">· {mvp} MVP</span>
    </motion.div>
  );
}
