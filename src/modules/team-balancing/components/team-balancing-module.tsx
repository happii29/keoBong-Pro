"use client";

import { useMemo, useState } from "react";
import {
  Clipboard,
  Goal,
  RefreshCw,
  Scale,
  Timer,
  Trophy,
  UsersRound,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTeamSlug } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { BalancePlayer, BalancedTeam, PlayerPosition } from "../team-balancing.types";

type TeamBalancingModuleProps = {
  teamSlug: string;
};

type PositionGroup = "GK" | "DEF" | "MID" | "ATT";

const positionGroups: Record<PlayerPosition, PositionGroup> = {
  GK: "GK",
  CB: "DEF",
  LB: "DEF",
  RB: "DEF",
  DM: "MID",
  CM: "MID",
  AM: "MID",
  LW: "ATT",
  RW: "ATT",
  ST: "ATT",
};

const players: BalancePlayer[] = [
  { id: "p1", name: "Minh Nguyễn", shirtNumber: 9, level: 8.8, position: "ST" },
  { id: "p2", name: "Quân Trần", shirtNumber: 8, level: 8.2, position: "CM" },
  { id: "p3", name: "Hưng Phạm", shirtNumber: 1, level: 7.8, position: "GK", isGoalkeeper: true },
  { id: "p4", name: "Long Lê", shirtNumber: 5, level: 7.4, position: "CB", isLate: true },
  { id: "p5", name: "Tuấn Anh", shirtNumber: 11, level: 8.5, position: "LW" },
  { id: "p6", name: "Khải Võ", shirtNumber: 2, level: 7.1, position: "RB" },
  { id: "p7", name: "Duy Hoàng", shirtNumber: 6, level: 7.7, position: "DM" },
  { id: "p8", name: "Nam Phạm", shirtNumber: 7, level: 8.0, position: "RW" },
  { id: "p9", name: "Bảo Trần", shirtNumber: 4, level: 7.3, position: "CB" },
  { id: "p10", name: "Khoa Đặng", shirtNumber: 10, level: 8.6, position: "AM" },
  { id: "p11", name: "Phúc Lâm", shirtNumber: 12, level: 6.9, position: "LB" },
  { id: "p12", name: "Thắng Bùi", shirtNumber: 14, level: 7.5, position: "CM", isLate: true },
  { id: "p13", name: "Tín Vũ", shirtNumber: 22, level: 7.2, position: "GK", isGoalkeeper: true },
  { id: "p14", name: "Sơn Cao", shirtNumber: 17, level: 7.9, position: "ST" },
];

function playerWeight(player: BalancePlayer) {
  return player.level - (player.isLate ? 0.35 : 0);
}

function seededValue(seed: number, index: number) {
  const x = Math.sin(seed * 1000 + index * 97.13) * 10000;
  return x - Math.floor(x);
}

function teamScore(team: BalancePlayer[]) {
  return team.reduce((total, player) => total + playerWeight(player), 0);
}

function groupCount(team: BalancePlayer[], group: PositionGroup) {
  return team.filter((player) => positionGroups[player.position] === group).length;
}

function placementCost(team: BalancePlayer[], otherTeam: BalancePlayer[], player: BalancePlayer) {
  const nextScore = teamScore([...team, player]);
  const otherScore = teamScore(otherTeam);
  const group = positionGroups[player.position];
  const groupPenalty = groupCount(team, group) - groupCount(otherTeam, group);
  const keeperPenalty = player.isGoalkeeper && team.some((item) => item.isGoalkeeper) ? 1.8 : 0;
  const sizePenalty = Math.max(0, team.length - otherTeam.length) * 1.2;

  return Math.abs(nextScore - otherScore) + Math.max(0, groupPenalty) * 0.55 + keeperPenalty + sizePenalty;
}

function balanceTeams(seed: number): BalancedTeam[] {
  const indexedPlayers = players.map((player, index) => ({ player, index }));
  const ordered = indexedPlayers
    .sort((a, b) => {
      const scoreDiff = playerWeight(b.player) - playerWeight(a.player);
      if (Math.abs(scoreDiff) > 0.01) {
        return scoreDiff;
      }

      return seededValue(seed, a.index) - seededValue(seed, b.index);
    })
    .map((item) => item.player);

  const teams: [BalancePlayer[], BalancePlayer[]] = [[], []];

  ordered.forEach((player, index) => {
    const firstCost = placementCost(teams[0], teams[1], player);
    const secondCost = placementCost(teams[1], teams[0], player);

    if (Math.abs(firstCost - secondCost) < 0.2) {
      teams[(index + seed) % 2].push(player);
      return;
    }

    teams[firstCost <= secondCost ? 0 : 1].push(player);
  });

  return [
    { key: "red", name: "Đội Đỏ", players: teams[0] },
    { key: "blue", name: "Đội Xanh", players: teams[1] },
  ];
}

function positionSummary(team: BalancePlayer[]) {
  return {
    GK: groupCount(team, "GK"),
    DEF: groupCount(team, "DEF"),
    MID: groupCount(team, "MID"),
    ATT: groupCount(team, "ATT"),
  };
}

function compactSummary(team: BalancePlayer[]) {
  const summary = positionSummary(team);
  return `${summary.DEF}/${summary.MID}/${summary.ATT}`;
}

function buildZaloMessage(teams: BalancedTeam[]) {
  return teams
    .map((team) => {
      const lineup = team.players
        .map((player, index) => {
          const tags = [player.position, player.isGoalkeeper ? "GK" : "", player.isLate ? "Late" : ""]
            .filter(Boolean)
            .join(", ");

          return `${index + 1}. #${player.shirtNumber} ${player.name} (${tags})`;
        })
        .join("\n");

      return `${team.name} - ${teamScore(team.players).toFixed(1)} điểm\n${lineup}`;
    })
    .join("\n\n");
}

export function TeamBalancingModule({ teamSlug }: TeamBalancingModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState(false);
  const teams = useMemo(() => balanceTeams(seed), [seed]);
  const message = useMemo(() => buildZaloMessage(teams), [teams]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Team balancing"
        title="Chia đội tự động"
        description={`${teamName} · Cân theo level, position, goalkeeper và late players`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="luxury" onClick={() => setSeed((current) => current + 1)}>
              <RefreshCw className="size-4" />
              Chia lại
            </Button>
            <Button variant="gold" onClick={handleCopy}>
              <Clipboard className="size-4" />
              {copied ? "Đã copy" : "Copy lineup gửi Zalo"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={UsersRound} label="Cầu thủ" value={players.length.toString()} />
        <Metric
          icon={Trophy}
          label="Level avg"
          value={(players.reduce((sum, player) => sum + player.level, 0) / players.length).toFixed(1)}
        />
        <Metric icon={Goal} label="Goalkeeper" value={players.filter((player) => player.isGoalkeeper).length.toString()} />
        <Metric icon={Timer} label="Late players" value={players.filter((player) => player.isLate).length.toString()} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <TacticalBoard teams={teams} />
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
            {teams.map((team) => (
              <TeamScoreCard key={team.key} team={team} />
            ))}
          </div>
          <Comparison teams={teams} />
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid size-10 place-items-center rounded-md border border-gold/25 bg-gold/12 text-gold">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamScoreCard({ team }: { team: BalancedTeam }) {
  const score = teamScore(team.players);
  const summary = positionSummary(team.players);

  return (
    <Card
      className={cn(
        "overflow-hidden py-0",
        team.key === "red" ? "border-red-400/24 bg-red-500/8" : "border-sky-400/24 bg-sky-500/8",
      )}
    >
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  team.key === "red"
                    ? "bg-red-400 shadow-[0_0_18px_rgb(248_113_113)]"
                    : "bg-sky-400 shadow-[0_0_18px_rgb(56_189_248)]",
                )}
              />
              {team.name}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{team.players.length} cầu thủ</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Tổng điểm</p>
            <p className="font-display text-3xl font-semibold">{score.toFixed(1)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="grid grid-cols-4 gap-2 text-center">
          {Object.entries(summary).map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-white/[0.045] px-2 py-2">
              <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
              <p className="font-display text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {team.players.map((player) => (
            <PlayerRow key={player.id} player={player} tone={team.key} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PlayerRow({ player, tone }: { player: BalancePlayer; tone: BalancedTeam["key"] }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.055] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-md font-display text-sm font-semibold",
            tone === "red" ? "bg-red-400/16 text-red-100" : "bg-sky-400/16 text-sky-100",
          )}
        >
          {player.shirtNumber}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{player.name}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="glass" className="px-2 py-0.5 text-[10px]">
              {player.position}
            </Badge>
            {player.isGoalkeeper ? (
              <Badge variant="emerald" className="px-2 py-0.5 text-[10px]">
                GK
              </Badge>
            ) : null}
            {player.isLate ? (
              <Badge variant="gold" className="px-2 py-0.5 text-[10px]">
                Late
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-display text-lg font-semibold">{player.level.toFixed(1)}</p>
        {player.isLate ? <p className="text-[10px] text-gold">-0.35</p> : null}
      </div>
    </div>
  );
}

function TacticalBoard({ teams }: { teams: BalancedTeam[] }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-emerald/25 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_34%),linear-gradient(135deg,rgba(8,47,73,0.96),rgba(6,78,59,0.88))] p-4 shadow-luxury">
      <div className="absolute inset-4 rounded-md border border-white/18" />
      <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-px bg-white/18" />
      <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18" />
      <div className="absolute left-4 top-1/2 h-48 w-20 -translate-y-1/2 border-y border-r border-white/18" />
      <div className="absolute right-4 top-1/2 h-48 w-20 -translate-y-1/2 border-y border-l border-white/18" />
      <div className="relative grid min-h-[488px] grid-cols-2 gap-4">
        {teams.map((team) => (
          <div key={team.key} className="flex flex-col justify-between gap-3 py-4">
            <div className={cn("flex items-center gap-2", team.key === "blue" && "justify-end")}>
              <Badge variant={team.key === "red" ? "destructive" : "emerald"}>{team.name}</Badge>
              <Badge variant="glass">{teamScore(team.players).toFixed(1)} pts</Badge>
            </div>
            <div className="grid gap-3">
              {team.players.map((player) => (
                <div
                  key={player.id}
                  className={cn(
                    "w-full max-w-[190px] rounded-md border px-3 py-2 shadow-luxury backdrop-blur-xl",
                    team.key === "red"
                      ? "justify-self-start border-red-300/25 bg-red-500/18"
                      : "justify-self-end border-sky-300/25 bg-sky-500/18 text-right",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold">{player.name}</span>
                    <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px]">{player.position}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={cn("text-xs text-white/60", team.key === "blue" && "text-right")}>
              Tactical board
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Comparison({ teams }: { teams: BalancedTeam[] }) {
  const [red, blue] = teams;
  const scoreDiff = Math.abs(teamScore(red.players) - teamScore(blue.players));
  const redLate = red.players.filter((player) => player.isLate).length;
  const blueLate = blue.players.filter((player) => player.isLate).length;
  const redKeepers = red.players.filter((player) => player.isGoalkeeper).length;
  const blueKeepers = blue.players.filter((player) => player.isGoalkeeper).length;

  const rows = [
    { label: "Tổng điểm", red: teamScore(red.players).toFixed(1), blue: teamScore(blue.players).toFixed(1) },
    { label: "Chênh lệch", red: scoreDiff.toFixed(1), blue: scoreDiff <= 0.8 ? "Cân" : "Lệch nhẹ" },
    { label: "Goalkeeper", red: redKeepers, blue: blueKeepers },
    { label: "Late players", red: redLate, blue: blueLate },
    { label: "Def/Mid/Att", red: compactSummary(red.players), blue: compactSummary(blue.players) },
  ];

  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="size-5 text-gold" />
          Team comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_1fr_1fr] border-b border-white/8 px-5 py-3 text-sm last:border-b-0"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold text-red-100">{row.red}</span>
            <span className="text-right font-semibold text-sky-100">{row.blue}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
