"use client";

import { useActionState, useState } from "react";
import type * as React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  UsersRound,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatTeamSlug } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import { createMatchAction, updateMatchStatusAction } from "../actions";
import { updateAttendanceStatusAction } from "../attendance-actions";
import type {
  MatchManagementAttendance,
  MatchFormState,
  MatchManagementMatch,
  MatchManagementPlayer,
  MatchManagementRole,
} from "../match-management.types";

type MatchManagementModuleProps = {
  teamSlug: string;
  role: MatchManagementRole;
  matches: MatchManagementMatch[];
  players: MatchManagementPlayer[];
  attendance: MatchManagementAttendance[];
  currentUserId: string;
  currentTime: string;
};

const managerRoles: MatchManagementRole[] = ["owner", "manager", "captain"];
const initialState: MatchFormState = {};

const formatOptions = [
  { value: "5v5", label: "5v5" },
  { value: "7v7", label: "7v7" },
  { value: "9v9", label: "9v9" },
  { value: "11v11", label: "11v11" },
  { value: "other", label: "Khác" },
] as const;

const statusMeta = {
  draft: { label: "Draft", variant: "glass" },
  scheduled: { label: "Scheduled", variant: "emerald" },
  locked: { label: "Locked", variant: "gold" },
  completed: { label: "Completed", variant: "glass" },
  cancelled: { label: "Cancelled", variant: "destructive" },
} as const;

export function MatchManagementModule({
  teamSlug,
  role,
  matches,
  players,
  attendance,
  currentUserId,
  currentTime,
}: MatchManagementModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const canManage = managerRoles.includes(role);
  const now = new Date(currentTime).getTime();
  const upcomingMatches = matches
    .filter(
      (match) =>
        new Date(match.starts_at).getTime() >= now &&
        match.status !== "completed" &&
        match.status !== "cancelled",
    )
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  const pastMatches = matches
    .filter(
      (match) =>
        new Date(match.starts_at).getTime() < now ||
        match.status === "completed" ||
        match.status === "cancelled",
    )
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
    );
  const nextMatch = upcomingMatches[0];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Match schedule"
        title="Trận đấu"
        description={`${teamName} · Tạo lịch đá, quản lý sân, đối thủ và trạng thái trận`}
        action={canManage ? <CreateMatchDialog teamSlug={teamSlug} /> : null}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={CalendarDays}
          label="Sắp tới"
          value={upcomingMatches.length.toString()}
          detail={nextMatch ? formatMatchDate(nextMatch.starts_at) : "Chưa có lịch"}
          tone="emerald"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Đã qua"
          value={pastMatches.length.toString()}
          detail="Bao gồm hoàn tất và đã hủy"
          tone="gold"
        />
        <MetricCard
          icon={UsersRound}
          label="Quyền"
          value={canManage ? "Manage" : "View"}
          detail={canManage ? "Có thể tạo và cập nhật" : "Chỉ xem lịch"}
          tone="slate"
        />
      </div>

      <MatchSection
        title="Trận sắp tới"
        emptyText={
          canManage
            ? "Chưa có trận sắp tới. Tạo trận đầu tiên để mở điểm danh."
            : "Captain chưa tạo trận sắp tới."
        }
        matches={upcomingMatches}
        teamSlug={teamSlug}
        canManage={canManage}
        players={players}
        attendance={attendance}
        currentUserId={currentUserId}
      />

      <MatchSection
        title="Trận đã qua"
        emptyText="Chưa có lịch sử trận đấu."
        matches={pastMatches}
        teamSlug={teamSlug}
        canManage={canManage}
        players={players}
        attendance={attendance}
        currentUserId={currentUserId}
      />
    </section>
  );
}

function CreateMatchDialog({ teamSlug }: { teamSlug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="lg">
          <Plus className="size-4" />
          Tạo trận
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo trận đấu</DialogTitle>
          <DialogDescription>
            Nhập thông tin trận để đội có lịch đá và chuẩn bị điểm danh.
          </DialogDescription>
        </DialogHeader>
        <MatchForm teamSlug={teamSlug} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function MatchForm({ teamSlug, onSuccess }: { teamSlug: string; onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(
    createMatchAction,
    initialState,
  );
  useActionFeedback(state, pending, {
    successTitle: "Đã tạo trận đấu",
    onSuccess,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="teamSlug" value={teamSlug} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold">Đối thủ</span>
          <Input
            name="opponentName"
            maxLength={100}
            placeholder="FC Anh Em"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Ngày giờ</span>
          <Input name="startsAt" type="datetime-local" required />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Sân</span>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="venueName"
            maxLength={120}
            placeholder="Sân Phú Thọ - Sân 3"
            className="pl-10"
          />
        </div>
      </label>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <label className="space-y-2">
          <span className="text-sm font-semibold">Format</span>
          <Select name="format" defaultValue="7v7">
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Số người tối thiểu</span>
          <Input
            name="minPlayers"
            type="number"
            min={1}
            max={99}
            defaultValue={10}
            required
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Ghi chú</span>
        <textarea
          name="notes"
          maxLength={500}
          rows={4}
          placeholder="Ví dụ: mặc áo trắng, chia tiền sân sau trận..."
          className="w-full rounded-lg border border-white/12 bg-white/[0.055] px-3.5 py-2 text-sm text-foreground shadow-luxury outline-none backdrop-blur-xl transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-emerald/45 focus:bg-white/[0.075] focus:ring-3 focus:ring-emerald/14"
        />
      </label>

      {state.error ? (
        <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      {state.message ? (
        <div className="rounded-md border border-emerald/25 bg-emerald/10 px-3 py-2 text-sm text-emerald">
          {state.message}
        </div>
      ) : null}

      <Button
        type="submit"
        variant="gold"
        className="w-full"
        loading={pending}
        loadingText="Đang tạo..."
      >
        <Plus className="size-4" />
        {pending ? "Đang tạo..." : "Tạo trận đấu"}
      </Button>
    </form>
  );
}

function MatchSection({
  title,
  emptyText,
  matches,
  teamSlug,
  canManage,
  players,
  attendance,
  currentUserId,
}: {
  title: string;
  emptyText: string;
  matches: MatchManagementMatch[];
  teamSlug: string;
  canManage: boolean;
  players: MatchManagementPlayer[];
  attendance: MatchManagementAttendance[];
  currentUserId: string;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock3 className="size-5 text-gold" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {matches.length ? (
          <div className="divide-y divide-white/10">
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                teamSlug={teamSlug}
                canManage={canManage}
                players={players}
                attendance={attendance.filter((item) => item.match_id === match.id)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="p-5">
            <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.035] px-5 py-8 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MatchRow({
  match,
  teamSlug,
  canManage,
  players,
  attendance,
  currentUserId,
}: {
  match: MatchManagementMatch;
  teamSlug: string;
  canManage: boolean;
  players: MatchManagementPlayer[];
  attendance: MatchManagementAttendance[];
  currentUserId: string;
}) {
  const status = statusMeta[match.status] ?? statusMeta.scheduled;
  const counts = getAttendanceCounts(players, attendance);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Badge variant="glass">{match.format}</Badge>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Min {match.min_players}
          </span>
        </div>
        <h3 className="mt-3 truncate font-display text-xl font-semibold">
          {match.opponent_name ? `KeoBong Pro vs ${match.opponent_name}` : "Trận nội bộ"}
        </h3>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-gold" />
            {formatMatchDate(match.starts_at)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-emerald" />
            {match.venue_name || "Chưa chọn sân"}
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald" />
            {match.status}
          </span>
        </div>
        {match.notes ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {match.notes}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-5 gap-2">
          <AttendancePill label="Đi" value={counts.going} tone="emerald" />
          <AttendancePill label="Trễ" value={counts.late} tone="gold" />
          <AttendancePill label="GK" value={counts.goalkeeper} tone="emerald" />
          <AttendancePill label="Vắng" value={counts.absent} tone="slate" />
          <AttendancePill label="Chờ" value={counts.pending} tone="slate" />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <AttendanceDialog
          match={match}
          teamSlug={teamSlug}
          players={players}
          attendance={attendance}
          canManage={canManage}
          currentUserId={currentUserId}
        />
      {canManage ? (
        <>
          {match.status !== "completed" ? (
            <StatusButton
              teamSlug={teamSlug}
              matchId={match.id}
              status="completed"
              label="Hoàn tất"
              icon="complete"
            />
          ) : null}
          {match.status !== "cancelled" ? (
            <StatusButton
              teamSlug={teamSlug}
              matchId={match.id}
              status="cancelled"
              label="Hủy"
              icon="cancel"
            />
          ) : (
            <StatusButton
              teamSlug={teamSlug}
              matchId={match.id}
              status="scheduled"
              label="Mở lại"
              icon="restore"
            />
          )}
        </>
      ) : null}
      </div>
    </div>
  );
}

function AttendanceDialog({
  match,
  teamSlug,
  players,
  attendance,
  canManage,
  currentUserId,
}: {
  match: MatchManagementMatch;
  teamSlug: string;
  players: MatchManagementPlayer[];
  attendance: MatchManagementAttendance[];
  canManage: boolean;
  currentUserId: string;
}) {
  const attendanceByPlayer = new Map(
    attendance.map((item) => [item.player_id, item.status]),
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm">
          <UserCheck className="size-4" />
          Điểm danh
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Điểm danh trận đấu</DialogTitle>
          <DialogDescription>
            {match.opponent_name ? `Đối thủ ${match.opponent_name}` : "Trận nội bộ"} ·{" "}
            {formatMatchDate(match.starts_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65svh] space-y-3 overflow-auto pr-1">
          {players.length ? (
            players.map((player) => {
              const status = attendanceByPlayer.get(player.id) ?? "pending";
              const canEdit = canManage || player.user_id === currentUserId;

              return (
                <div
                  key={player.id}
                  className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-gold/20 bg-gold/10 font-display text-sm font-semibold text-gold">
                        {player.shirt_number ?? "--"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {player.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.position ?? "Chưa chọn vị trí"} · {player.status}
                        </p>
                      </div>
                      <AttendanceStatusBadge status={status} />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {(["going", "late", "goalkeeper", "absent", "pending"] as const).map(
                      (nextStatus) => (
                        <AttendanceStatusButton
                          key={nextStatus}
                          teamSlug={teamSlug}
                          matchId={match.id}
                          playerId={player.id}
                          status={nextStatus}
                          active={status === nextStatus}
                          disabled={!canEdit}
                        />
                      ),
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.035] p-5 text-center text-sm text-muted-foreground">
              Chưa có cầu thủ trong đội. Hãy thêm cầu thủ trước khi điểm danh.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusButton({
  teamSlug,
  matchId,
  status,
  label,
  icon,
}: {
  teamSlug: string;
  matchId: string;
  status: MatchManagementMatch["status"];
  label: string;
  icon: "complete" | "cancel" | "restore";
}) {
  const Icon =
    icon === "complete" ? CheckCircle2 : icon === "cancel" ? XCircle : RotateCcw;
  const [state, formAction, pending] = useActionState(
    (_previousState: MatchFormState, formData: FormData) =>
      updateMatchStatusAction(formData),
    initialState,
  );

  useActionFeedback(state, pending, {
    successTitle: "Đã cập nhật trận đấu",
    errorTitle: "Không thể cập nhật trận đấu",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="teamSlug" value={teamSlug} />
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="status" value={status} />
      <Button
        type="submit"
        variant={icon === "complete" ? "emerald" : "luxury"}
        size="sm"
        loading={pending}
        loadingText="Đang cập nhật..."
      >
        <Icon className="size-4" />
        {label}
      </Button>
    </form>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "gold" | "slate";
}) {
  const toneClass = {
    emerald: "border-emerald/25 bg-emerald/12 text-emerald shadow-emerald",
    gold: "border-gold/25 bg-gold/12 text-gold shadow-gold",
    slate: "border-white/12 bg-white/[0.055] text-foreground shadow-luxury",
  }[tone];

  return (
    <Card className="premium-card-hover py-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 truncate font-display text-3xl font-semibold">
              {value}
            </p>
          </div>
          <div className={cn("grid size-11 place-items-center rounded-lg border", toneClass)}>
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-3 truncate text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-white/12 bg-white/[0.055] px-3.5 py-2 text-sm text-foreground shadow-luxury outline-none backdrop-blur-xl transition-all duration-200 focus:border-emerald/45 focus:bg-white/[0.075] focus:ring-3 focus:ring-emerald/14",
        className,
      )}
      {...props}
    />
  );
}

function AttendanceStatusButton({
  teamSlug,
  matchId,
  playerId,
  status,
  active,
  disabled,
}: {
  teamSlug: string;
  matchId: string;
  playerId: string;
  status: MatchManagementAttendance["status"];
  active: boolean;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    (_previousState: MatchFormState, formData: FormData) =>
      updateAttendanceStatusAction(formData),
    initialState,
  );

  useActionFeedback(state, pending, {
    successTitle: "Đã cập nhật điểm danh",
    errorTitle: "Không thể cập nhật điểm danh",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="teamSlug" value={teamSlug} />
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="status" value={status} />
      <Button
        type="submit"
        variant={active ? "emerald" : "luxury"}
        size="sm"
        disabled={disabled}
        loading={pending}
        loadingText="Đang lưu..."
      >
        {attendanceStatusLabel(status)}
      </Button>
    </form>
  );
}

function AttendanceStatusBadge({
  status,
}: {
  status: MatchManagementAttendance["status"];
}) {
  const variant =
    status === "going" || status === "goalkeeper"
      ? "emerald"
      : status === "late"
        ? "gold"
        : status === "absent"
          ? "destructive"
          : "glass";

  return <Badge variant={variant}>{attendanceStatusLabel(status)}</Badge>;
}

function AttendancePill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "gold" | "slate";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald/20 bg-emerald/10 text-emerald"
      : tone === "gold"
        ? "border-gold/20 bg-gold/10 text-gold"
        : "border-white/10 bg-white/[0.045] text-foreground";

  return (
    <div className={cn("rounded-md border p-2 text-center", toneClass)}>
      <p className="font-display text-lg font-semibold">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold">{label}</p>
    </div>
  );
}

function getAttendanceCounts(
  players: MatchManagementPlayer[],
  attendance: MatchManagementAttendance[],
) {
  const statuses = new Map(attendance.map((item) => [item.player_id, item.status]));

  return players.reduce(
    (counts, player) => {
      const status = statuses.get(player.id) ?? "pending";
      counts[status] += 1;
      return counts;
    },
    {
      going: 0,
      late: 0,
      goalkeeper: 0,
      absent: 0,
      pending: 0,
    },
  );
}

function attendanceStatusLabel(status: MatchManagementAttendance["status"]) {
  const labels = {
    going: "Đi",
    late: "Trễ",
    goalkeeper: "GK",
    absent: "Vắng",
    pending: "Chờ",
  };

  return labels[status];
}

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
