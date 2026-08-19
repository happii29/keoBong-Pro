"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CalendarDays,
  Crown,
  Edit3,
  Percent,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Star,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SoccerLoader } from "@/components/ui/soccer-loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTeamSlug } from "@/lib/format";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import { updateMatchRankingStatsAction } from "../actions";
import type {
  RankingFormState,
  RankingMatchInput,
  RankingPlayer,
  RankingRole,
  RankingStatPlayer,
} from "../ranking.types";
import { RankingTable } from "./ranking-table";
import { TopPlayersSection } from "./top-players-section";

type RankingModuleProps = {
  teamSlug: string;
  role: RankingRole;
  canManage: boolean;
  players: RankingPlayer[];
  matches: RankingMatchInput[];
};

const initialState: RankingFormState = {};

function metricLeader(
  players: RankingPlayer[],
  metric: keyof Pick<RankingPlayer, "goals" | "assists" | "mvp" | "attendance" | "winRate">,
) {
  return [...players].sort((a, b) => Number(b[metric]) - Number(a[metric]) || a.name.localeCompare(b.name))[0];
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function hasScore(match: RankingMatchInput) {
  return match.teamScore !== null && match.opponentScore !== null;
}

function hasPlayerStats(match: RankingMatchInput) {
  return match.players.some((player) => player.goals > 0 || player.assists > 0 || player.mvp);
}

function matchResult(match: RankingMatchInput) {
  if (!hasScore(match)) {
    return "Chưa nhập";
  }

  if (Number(match.teamScore) > Number(match.opponentScore)) {
    return "Thắng";
  }

  if (Number(match.teamScore) < Number(match.opponentScore)) {
    return "Thua";
  }

  return "Hòa";
}

export function RankingModule({ teamSlug, canManage, players, matches }: RankingModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const goalsLeader = metricLeader(players, "goals");
  const assistsLeader = metricLeader(players, "assists");
  const mvpLeader = metricLeader(players, "mvp");
  const attendanceLeader = metricLeader(players, "attendance");
  const winRateLeader = metricLeader(players, "winRate");

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Ranking"
        title="Bảng xếp hạng cầu thủ"
        description={`${teamName} · Goals, assists, MVP, attendance và win rate từ dữ liệu thật`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <RankingMetric icon={Target} label="Goals leader" value={(goalsLeader?.goals ?? 0).toString()} detail={goalsLeader?.name ?? "Chưa có"} />
        <RankingMetric icon={Star} label="Assists top" value={(assistsLeader?.assists ?? 0).toString()} detail={assistsLeader?.name ?? "Chưa có"} />
        <RankingMetric icon={Crown} label="MVP top" value={(mvpLeader?.mvp ?? 0).toString()} detail={mvpLeader?.name ?? "Chưa có"} />
        <RankingMetric icon={UsersRound} label="Attendance" value={`${attendanceLeader?.attendance ?? 0}%`} detail={attendanceLeader?.name ?? "Best attendance"} />
        <RankingMetric icon={Percent} label="Win rate" value={`${winRateLeader?.winRate ?? 0}%`} detail={winRateLeader?.name ?? "Top player rate"} />
      </div>

      {canManage ? <MatchStatsWorkspace teamSlug={teamSlug} matches={matches} /> : null}

      {players.length ? (
        <>
          <TopPlayersSection players={players} />
          <RankingTable players={players} />
        </>
      ) : (
        <Card className="py-0">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Chưa có cầu thủ để tính ranking. Hãy thêm cầu thủ, điểm danh trận và nhập stats sau trận.
          </CardContent>
        </Card>
      )}
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

function MatchStatsWorkspace({ teamSlug, matches }: { teamSlug: string; matches: RankingMatchInput[] }) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return matches.filter((match) => {
      const matchDate = match.startsAt.slice(0, 10);
      const matchesQuery = !normalizedQuery || match.label.toLowerCase().includes(normalizedQuery);
      const matchesFrom = !fromDate || matchDate >= fromDate;
      const matchesTo = !toDate || matchDate <= toDate;

      return matchesQuery && matchesFrom && matchesTo;
    });
  }, [fromDate, matches, query, toDate]);

  const completedCount = matches.filter((match) => hasScore(match)).length;
  const statReadyCount = matches.filter((match) => hasScore(match) && hasPlayerStats(match)).length;

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5 text-gold" />
              Trận đấu & cập nhật ranking
            </CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="glass">{matches.length} trận</Badge>
              <Badge variant="emerald">{completedCount} có tỷ số</Badge>
              <Badge variant="gold">{statReadyCount} có stats</Badge>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(190px,1fr)_150px_150px_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm đối thủ, ngày..."
                className="pl-9"
              />
            </label>
            <Input value={fromDate} onChange={(event) => setFromDate(event.target.value)} type="date" aria-label="Từ ngày" />
            <Input value={toDate} onChange={(event) => setToDate(event.target.value)} type="date" aria-label="Đến ngày" />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setFromDate("");
                setToDate("");
              }}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {matches.length ? (
          <>
            <div className="hidden lg:block">
              <MatchStatsTable teamSlug={teamSlug} matches={filteredMatches} />
            </div>
            <div className="grid gap-3 p-4 lg:hidden">
              {filteredMatches.map((match) => (
                <MatchStatsCard key={match.id} teamSlug={teamSlug} match={match} />
              ))}
            </div>
            {!filteredMatches.length ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Không có trận phù hợp bộ lọc.</div>
            ) : null}
          </>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">Chưa có trận đấu để nhập ranking.</div>
        )}
      </CardContent>
    </Card>
  );
}

function MatchStatsTable({ teamSlug, matches }: { teamSlug: string; matches: RankingMatchInput[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ngày</TableHead>
          <TableHead>Trận đấu</TableHead>
          <TableHead className="text-right">Tỷ số</TableHead>
          <TableHead className="text-right">Cầu thủ</TableHead>
          <TableHead className="text-right">G/A/MVP</TableHead>
          <TableHead className="text-right">Kết quả</TableHead>
          <TableHead className="w-[120px] text-right">Cập nhật</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.id}>
            <TableCell className="text-muted-foreground">{formatDateOnly(match.startsAt)}</TableCell>
            <TableCell>
              <p className="font-semibold">{match.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{match.status}</p>
            </TableCell>
            <TableCell className="text-right font-semibold">
              {hasScore(match) ? `${match.teamScore} - ${match.opponentScore}` : "-"}
            </TableCell>
            <TableCell className="text-right">{match.players.length}</TableCell>
            <TableCell className="text-right text-sm">
              {match.players.reduce((sum, player) => sum + player.goals, 0)}/
              {match.players.reduce((sum, player) => sum + player.assists, 0)}/
              {match.players.filter((player) => player.mvp).length}
            </TableCell>
            <TableCell className="text-right">
              <ResultBadge match={match} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <MatchStatsDialog teamSlug={teamSlug} match={match} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MatchStatsCard({ teamSlug, match }: { teamSlug: string; match: RankingMatchInput }) {
  const goals = match.players.reduce((sum, player) => sum + player.goals, 0);
  const assists = match.players.reduce((sum, player) => sum + player.assists, 0);
  const mvps = match.players.filter((player) => player.mvp).length;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{match.label}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 text-gold" />
            {formatDateTime(match.startsAt)}
          </p>
        </div>
        <ResultBadge match={match} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        <MiniStat label="Tỷ số" value={hasScore(match) ? `${match.teamScore}-${match.opponentScore}` : "-"} />
        <MiniStat label="Cầu thủ" value={match.players.length} />
        <MiniStat label="G/A" value={`${goals}/${assists}`} />
        <MiniStat label="MVP" value={mvps} />
      </div>
      <div className="mt-4 flex justify-end">
        <MatchStatsDialog teamSlug={teamSlug} match={match} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.045] p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function ResultBadge({ match }: { match: RankingMatchInput }) {
  const result = matchResult(match);
  const variant = result === "Thắng" ? "emerald" : result === "Thua" ? "gold" : "glass";

  return <Badge variant={variant}>{result}</Badge>;
}

function MatchStatsDialog({ teamSlug, match }: { teamSlug: string; match: RankingMatchInput }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="luxury" size="sm">
          <Edit3 className="size-4" />
          Cập nhật
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật stats trận</DialogTitle>
          <DialogDescription>
            {match.label} · {formatDateTime(match.startsAt)}
          </DialogDescription>
        </DialogHeader>
        <MatchStatsForm teamSlug={teamSlug} match={match} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function MatchStatsForm({
  teamSlug,
  match,
  onSuccess,
}: {
  teamSlug: string;
  match: RankingMatchInput;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateMatchRankingStatsAction, initialState);
  useActionFeedback(state, pending, {
    successTitle: "Đã cập nhật stats",
    onSuccess,
  });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="teamSlug" value={teamSlug} />
      <input type="hidden" name="matchId" value={match.id} />

      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="grid gap-1.5 text-sm font-medium">
          Đội mình
          <Input name="teamScore" type="number" min={0} step={1} defaultValue={match.teamScore ?? 0} aria-label="Tỷ số đội mình" />
        </label>
        <div className="hidden pb-3 text-center text-sm text-muted-foreground sm:block">vs</div>
        <label className="grid gap-1.5 text-sm font-medium">
          Đối thủ
          <Input name="opponentScore" type="number" min={0} step={1} defaultValue={match.opponentScore ?? 0} aria-label="Tỷ số đối thủ" />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.035] px-4 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-gold" />
            <p className="text-sm font-semibold">Stats cầu thủ</p>
          </div>
          <Badge variant="glass">{match.players.length} cầu thủ</Badge>
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cầu thủ</TableHead>
                <TableHead className="w-[120px] text-right">Goals</TableHead>
                <TableHead className="w-[120px] text-right">Assists</TableHead>
                <TableHead className="w-[96px] text-center">MVP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {match.players.map((player) => (
                <PlayerStatRow key={player.id} player={player} />
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {match.players.map((player) => (
            <PlayerStatMobileRow key={player.id} player={player} />
          ))}
        </div>

        {!match.players.length ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Chưa có cầu thủ điểm danh cho trận này.</div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          {state.error ? <p className="font-medium text-destructive">{state.error}</p> : null}
          {state.message ? <p className="font-medium text-emerald">{state.message}</p> : null}
        </div>
        <Button type="submit" variant="emerald" disabled={!match.players.length || pending}>
          {pending ? <SoccerLoader /> : <Save className="size-4" />}
          Lưu stats
        </Button>
      </div>
    </form>
  );
}

function PlayerStatRow({ player }: { player: RankingStatPlayer }) {
  return (
    <TableRow>
      <TableCell>
        <input type="hidden" name="playerId" value={player.id} />
        <PlayerName player={player} />
      </TableCell>
      <TableCell>
        <Input name={`goals:${player.id}`} type="number" min={0} step={1} defaultValue={player.goals} className="ml-auto max-w-24 text-right" />
      </TableCell>
      <TableCell>
        <Input name={`assists:${player.id}`} type="number" min={0} step={1} defaultValue={player.assists} className="ml-auto max-w-24 text-right" />
      </TableCell>
      <TableCell className="text-center">
        <input name={`mvp:${player.id}`} type="checkbox" defaultChecked={player.mvp} className="size-4 accent-emerald" />
      </TableCell>
    </TableRow>
  );
}

function PlayerStatMobileRow({ player }: { player: RankingStatPlayer }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <input type="hidden" name="playerId" value={player.id} />
      <PlayerName player={player} />
      <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
        <label className="grid gap-1 text-xs text-muted-foreground">
          Goals
          <Input name={`goals:${player.id}`} type="number" min={0} step={1} defaultValue={player.goals} />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Assists
          <Input name={`assists:${player.id}`} type="number" min={0} step={1} defaultValue={player.assists} />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm">
          <input name={`mvp:${player.id}`} type="checkbox" defaultChecked={player.mvp} className="size-4 accent-emerald" />
          MVP
        </label>
      </div>
    </div>
  );
}

function PlayerName({ player }: { player: RankingStatPlayer }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.055] text-sm font-semibold">
        {player.shirtNumber ?? "-"}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{player.name}</p>
        <p className="text-xs text-muted-foreground">{player.position || "-"}</p>
      </div>
    </div>
  );
}
