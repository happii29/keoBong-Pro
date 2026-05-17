"use client";

import { Crown, Flame } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { RankingPlayer } from "../ranking.types";
import { PlayerCard } from "./player-card";

type TopPlayersSectionProps = {
  players: RankingPlayer[];
};

export function TopPlayersSection({ players }: TopPlayersSectionProps) {
  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="relative p-5 sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,189,73,0.16),transparent_38%),linear-gradient(225deg,rgba(16,185,129,0.15),transparent_34%)]" />
        <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">
                <Crown className="size-3" />
                Top 1/2/3
              </Badge>
              <Badge variant="glass">
                <Flame className="size-3" />
                FIFA-style cards
              </Badge>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold">Top players tháng này</h3>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm text-muted-foreground"
          >
            Dựa trên goals, assists, MVP, attendance và win rate
          </motion.div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {players.slice(0, 3).map((player, index) => (
            <PlayerCard key={player.id} player={player} delay={index * 0.08} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
