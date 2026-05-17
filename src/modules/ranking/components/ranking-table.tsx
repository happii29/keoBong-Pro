"use client";

import { ArrowUpRight, Crown, Medal, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { RankingPlayer } from "../ranking.types";
import { MVPBadge } from "./mvp-badge";

type RankingTableProps = {
  players: RankingPlayer[];
};

export function RankingTable({ players }: RankingTableProps) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="size-5 text-gold" />
            Ranking table
          </CardTitle>
          <Badge variant="emerald">Live season</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Goals</TableHead>
                <TableHead className="text-right">Assists</TableHead>
                <TableHead className="text-right">MVP</TableHead>
                <TableHead className="text-right">Attendance</TableHead>
                <TableHead className="text-right">Win rate</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: index * 0.035 }}
                  className="border-b border-white/8 transition-colors hover:bg-white/[0.045]"
                >
                  <TableCell>
                    <RankCell rank={player.rank} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-md border border-white/10 bg-white/[0.055] font-semibold">
                        {player.shirtNumber}
                      </div>
                      <div>
                        <p className="font-semibold">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{player.goals}</TableCell>
                  <TableCell className="text-right font-semibold">{player.assists}</TableCell>
                  <TableCell className="text-right">
                    <MVPBadge rank={player.rank} mvp={player.mvp} className="ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">{player.attendance}%</TableCell>
                  <TableCell className="text-right">{player.winRate}%</TableCell>
                  <TableCell className="text-right font-display text-xl font-semibold text-gold">{player.rating}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="rounded-md border border-white/10 bg-white/[0.045] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <RankCell rank={player.rank} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{player.name}</p>
                    <p className="text-xs text-muted-foreground">#{player.shirtNumber} · {player.position}</p>
                  </div>
                </div>
                <p className="font-display text-2xl font-semibold text-gold">{player.rating}</p>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
                <MobileStat icon={Target} label="G" value={player.goals} />
                <MobileStat icon={ArrowUpRight} label="A" value={player.assists} />
                <MobileStat icon={Crown} label="MVP" value={player.mvp} />
                <MobileStat label="ATT" value={`${player.attendance}%`} />
                <MobileStat label="WIN" value={`${player.winRate}%`} />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RankCell({ rank }: { rank: number }) {
  return (
    <div
      className={cn(
        "grid size-10 place-items-center rounded-md border font-display text-sm font-semibold",
        rank === 1 && "border-gold/40 bg-gold/16 text-gold",
        rank === 2 && "border-slate-200/25 bg-white/12 text-slate-100",
        rank === 3 && "border-orange-300/35 bg-orange-400/14 text-orange-200",
        rank > 3 && "border-white/10 bg-white/[0.05] text-muted-foreground",
      )}
    >
      {rank === 1 ? <Crown className="size-4" /> : rank <= 3 ? <Medal className="size-4" /> : rank}
    </div>
  );
}

function MobileStat({ icon: Icon, label, value }: { icon?: typeof Target; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-2">
      <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        {Icon ? <Icon className="size-3 text-gold" /> : null}
        {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
