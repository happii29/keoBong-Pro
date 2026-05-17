"use client";

import { Activity, Shield, Sparkles, Star, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { RankingPlayer } from "../ranking.types";
import { MVPBadge } from "./mvp-badge";

type PlayerCardProps = {
  player: RankingPlayer;
  delay?: number;
};

const podiumStyles = {
  1: "border-gold/45 bg-[linear-gradient(155deg,rgba(245,189,73,0.26),rgba(255,255,255,0.055)_38%,rgba(16,185,129,0.12))]",
  2: "border-slate-200/30 bg-[linear-gradient(155deg,rgba(226,232,240,0.22),rgba(255,255,255,0.05)_42%,rgba(125,211,252,0.12))]",
  3: "border-orange-300/35 bg-[linear-gradient(155deg,rgba(251,146,60,0.2),rgba(255,255,255,0.05)_42%,rgba(245,189,73,0.1))]",
} as const;

export function PlayerCard({ player, delay = 0 }: PlayerCardProps) {
  const podiumClass =
    player.rank === 1 || player.rank === 2 || player.rank === 3
      ? podiumStyles[player.rank]
      : "border-white/12 bg-white/[0.055]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, rotateX: 2, rotateY: player.rank === 1 ? -2 : 2 }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn("relative min-h-[330px] overflow-hidden rounded-lg border p-4 shadow-luxury backdrop-blur-xl", podiumClass)}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      <div className="absolute -right-10 -top-10 size-32 rounded-full border border-white/10" />
      <div className="absolute -bottom-16 left-1/2 size-44 -translate-x-1/2 rounded-full border border-white/8" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-display text-5xl font-semibold leading-none">{player.rating}</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{player.position}</p>
        </div>
        <MVPBadge rank={player.rank} mvp={player.mvp} />
      </div>

      <div className="relative mt-8 grid place-items-center">
        <div className="grid size-28 place-items-center rounded-full border border-white/12 bg-[radial-gradient(circle,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] shadow-luxury">
          <div className="grid size-20 place-items-center rounded-full border border-gold/25 bg-luxury-black/60 font-display text-3xl font-semibold text-gold">
            {player.shirtNumber}
          </div>
        </div>
      </div>

      <div className="relative mt-7 text-center">
        <h3 className="truncate font-display text-xl font-semibold">{player.name}</h3>
        <div className="mt-2 flex justify-center">
          <Badge variant={player.form === "hot" ? "gold" : player.form === "up" ? "emerald" : "glass"}>
            <Sparkles className="size-3" />
            {player.form === "hot" ? "Hot form" : player.form === "up" ? "Rising" : "Stable"}
          </Badge>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
        <CardStat icon={Target} label="GOL" value={player.goals} />
        <CardStat icon={Star} label="AST" value={player.assists} />
        <CardStat icon={Trophy} label="MVP" value={player.mvp} />
      </div>
      <div className="relative mt-3 grid grid-cols-2 gap-2 text-center">
        <CardStat icon={Activity} label="ATT" value={`${player.attendance}%`} />
        <CardStat icon={Shield} label="WIN" value={`${player.winRate}%`} />
      </div>
    </motion.article>
  );
}

function CardStat({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.05] p-2">
      <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
        <Icon className="size-3 text-gold" />
        {label}
      </div>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
