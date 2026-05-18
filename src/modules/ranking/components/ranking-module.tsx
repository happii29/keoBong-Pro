"use client";

import { Crown, Percent, Star, Target, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatTeamSlug } from "@/lib/format";

import { rankingPlayers } from "../data/ranking-data";
import { RankingTable } from "./ranking-table";
import { TopPlayersSection } from "./top-players-section";

type RankingModuleProps = {
  teamSlug: string;
};

export function RankingModule({ teamSlug }: RankingModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const leader = rankingPlayers[0];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Ranking"
        title="Bảng xếp hạng cầu thủ"
        description={`${teamName} · Goals, assists, MVP, attendance và win rate`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <RankingMetric icon={Target} label="Goals leader" value={leader.goals.toString()} detail={leader.name} />
        <RankingMetric icon={Star} label="Assists top" value="15" detail="Quân Trần" />
        <RankingMetric icon={Crown} label="MVP top" value={leader.mvp.toString()} detail={leader.name} />
        <RankingMetric icon={UsersRound} label="Attendance" value="97%" detail="Best attendance" />
        <RankingMetric icon={Percent} label="Win rate" value={`${leader.winRate}%`} detail="Top player rate" />
      </div>

      <TopPlayersSection players={rankingPlayers} />
      <RankingTable players={rankingPlayers} />
    </section>
  );
}

function RankingMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="premium-card-hover py-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-md border border-gold/25 bg-gold/12 text-gold shadow-gold">
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-3 truncate text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
