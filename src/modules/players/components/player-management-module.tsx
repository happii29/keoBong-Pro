"use client";

import { useActionState, useState } from "react";
import {
  Dumbbell,
  Edit3,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";

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
import { cn } from "@/lib/utils";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import {
  createPlayerAction,
  deletePlayerAction,
  updatePlayerAction,
} from "../actions";
import type {
  PlayerFormState,
  PlayerManagementPlayer,
  PlayerManagementRole,
} from "../player-management.types";

type PlayerManagementModuleProps = {
  teamSlug: string;
  role: PlayerManagementRole;
  players: PlayerManagementPlayer[];
};

const managerRoles: PlayerManagementRole[] = ["owner", "manager", "captain"];
const initialState: PlayerFormState = {};

const positionOptions = [
  "",
  "GK",
  "CB",
  "LB",
  "RB",
  "DM",
  "CM",
  "AM",
  "LW",
  "RW",
  "ST",
] as const;

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "injured", label: "Injured" },
  { value: "inactive", label: "Inactive" },
] as const;

const statusMeta = {
  active: { label: "Active", variant: "emerald" },
  injured: { label: "Injured", variant: "gold" },
  inactive: { label: "Inactive", variant: "glass" },
  left: { label: "Left", variant: "glass" },
} as const;

export function PlayerManagementModule({
  teamSlug,
  role,
  players,
}: PlayerManagementModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const canManage = managerRoles.includes(role);
  const activePlayers = players.filter((player) => player.status === "active");
  const injuredPlayers = players.filter((player) => player.status === "injured");
  const avgLevel = players.length
    ? players.reduce((sum, player) => sum + Number(player.level), 0) / players.length
    : 0;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Squad management"
        title="Đội hình"
        description={`${teamName} · Danh sách cầu thủ, số áo, vị trí, level và thông tin liên hệ`}
        action={canManage ? <CreatePlayerDialog teamSlug={teamSlug} /> : null}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={UsersRound}
          label="Cầu thủ"
          value={players.length.toString()}
          detail={`${activePlayers.length} active`}
          tone="emerald"
        />
        <MetricCard
          icon={Dumbbell}
          label="Level trung bình"
          value={avgLevel ? avgLevel.toFixed(1) : "-"}
          detail="Thang điểm 1-10"
          tone="gold"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Chấn thương"
          value={injuredPlayers.length.toString()}
          detail={canManage ? "Có thể cập nhật" : "Chỉ xem"}
          tone="slate"
        />
      </div>

      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b border-white/10 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersRound className="size-5 text-emerald" />
            Danh sách cầu thủ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {players.length ? (
            <>
              <div className="hidden md:block">
                <PlayerTable
                  players={players}
                  teamSlug={teamSlug}
                  canManage={canManage}
                />
              </div>
              <div className="grid gap-3 p-4 md:hidden">
                {players.map((player) => (
                  <PlayerMobileCard
                    key={player.id}
                    player={player}
                    teamSlug={teamSlug}
                    canManage={canManage}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="p-5">
              <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.035] px-5 py-8 text-center">
                <UserRound className="size-10 text-gold" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Chưa có cầu thủ
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {canManage
                    ? "Thêm cầu thủ đầu tiên để bắt đầu điểm danh, chia đội và tính ranking."
                    : "Captain chưa thêm cầu thủ vào đội."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function PlayerTable({
  players,
  teamSlug,
  canManage,
}: {
  players: PlayerManagementPlayer[];
  teamSlug: string;
  canManage: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cầu thủ</TableHead>
          <TableHead>Số áo</TableHead>
          <TableHead>Vị trí</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Liên hệ</TableHead>
          <TableHead>Trạng thái</TableHead>
          {canManage ? <TableHead className="text-right">Thao tác</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell>
              <div className="font-semibold">{player.display_name}</div>
              {player.zalo_name ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  Zalo: {player.zalo_name}
                </div>
              ) : null}
            </TableCell>
            <TableCell>{player.shirt_number ?? "-"}</TableCell>
            <TableCell>{player.position ?? "-"}</TableCell>
            <TableCell>{Number(player.level).toFixed(1)}</TableCell>
            <TableCell>
              {player.phone ? (
                <span className="inline-flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {player.phone}
                </span>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <PlayerStatusBadge status={player.status} />
            </TableCell>
            {canManage ? (
              <TableCell>
                <PlayerActions player={player} teamSlug={teamSlug} />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PlayerMobileCard({
  player,
  teamSlug,
  canManage,
}: {
  player: PlayerManagementPlayer;
  teamSlug: string;
  canManage: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-md border border-gold/20 bg-gold/10 font-display text-sm font-semibold text-gold">
              {player.shirt_number ?? "--"}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{player.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {player.position ?? "Chưa chọn vị trí"} · Level{" "}
                {Number(player.level).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        <PlayerStatusBadge status={player.status} />
      </div>
      <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
        <span>{player.phone || "Chưa có số điện thoại"}</span>
        <span>{player.zalo_name ? `Zalo: ${player.zalo_name}` : "Chưa có Zalo name"}</span>
      </div>
      {canManage ? (
        <div className="mt-4">
          <PlayerActions player={player} teamSlug={teamSlug} />
        </div>
      ) : null}
    </div>
  );
}

function CreatePlayerDialog({ teamSlug }: { teamSlug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="lg">
          <Plus className="size-4" />
          Thêm cầu thủ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm cầu thủ</DialogTitle>
          <DialogDescription>
            Tạo hồ sơ cầu thủ để dùng cho điểm danh, chia đội, quỹ và ranking.
          </DialogDescription>
        </DialogHeader>
        <PlayerForm mode="create" teamSlug={teamSlug} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function PlayerActions({
  player,
  teamSlug,
}: {
  player: PlayerManagementPlayer;
  teamSlug: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="luxury" size="sm">
            <Edit3 className="size-4" />
            Sửa
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sửa cầu thủ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đội hình và liên hệ của cầu thủ.
            </DialogDescription>
          </DialogHeader>
          <PlayerForm mode="update" teamSlug={teamSlug} player={player} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <form action={deletePlayerAction}>
        <input type="hidden" name="teamSlug" value={teamSlug} />
        <input type="hidden" name="playerId" value={player.id} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="text-destructive hover:border-destructive/35"
        >
          <Trash2 className="size-4" />
          Xóa
        </Button>
      </form>
    </div>
  );
}

function PlayerForm({
  mode,
  teamSlug,
  player,
  onSuccess,
}: {
  mode: "create" | "update";
  teamSlug: string;
  player?: PlayerManagementPlayer;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createPlayerAction : updatePlayerAction,
    initialState,
  );
  useActionFeedback(state, pending, {
    successTitle: mode === "create" ? "Đã thêm cầu thủ" : "Đã cập nhật cầu thủ",
    onSuccess,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="teamSlug" value={teamSlug} />
      {player ? <input type="hidden" name="playerId" value={player.id} /> : null}

      <div className="grid gap-4 md:grid-cols-[1fr_140px]">
        <label className="space-y-2">
          <span className="text-sm font-semibold">Tên cầu thủ</span>
          <Input
            name="displayName"
            defaultValue={player?.display_name ?? ""}
            minLength={2}
            maxLength={80}
            required
            placeholder="Nguyễn Minh"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Số áo</span>
          <Input
            name="shirtNumber"
            type="number"
            min={0}
            max={999}
            defaultValue={player?.shirt_number ?? ""}
            placeholder="9"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold">Vị trí</span>
          <Select name="position" defaultValue={player?.position ?? ""}>
            {positionOptions.map((position) => (
              <option key={position || "none"} value={position}>
                {position || "Chưa chọn"}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold">Level</span>
          <Input
            name="level"
            type="number"
            min={1}
            max={10}
            step={0.1}
            defaultValue={player?.level ?? 5}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold">Trạng thái</span>
          <Select name="status" defaultValue={player?.status ?? "active"}>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold">Số điện thoại</span>
          <Input
            name="phone"
            defaultValue={player?.phone ?? ""}
            maxLength={32}
            placeholder="090..."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Zalo name</span>
          <Input
            name="zaloName"
            defaultValue={player?.zalo_name ?? ""}
            maxLength={80}
            placeholder="Minh FC"
          />
        </label>
      </div>

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

      <Button type="submit" variant="gold" className="w-full" disabled={pending}>
        {pending ? <SoccerLoader /> : mode === "create" ? <Plus className="size-4" /> : <Edit3 className="size-4" />}
        {pending ? "Đang lưu..." : mode === "create" ? "Thêm cầu thủ" : "Lưu thay đổi"}
      </Button>
    </form>
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

function PlayerStatusBadge({
  status,
}: {
  status: PlayerManagementPlayer["status"];
}) {
  const meta = statusMeta[status] ?? statusMeta.inactive;

  return (
    <Badge variant={meta.variant}>
      {meta.label}
    </Badge>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          </div>
          <div className={cn("grid size-11 place-items-center rounded-lg border", toneClass)}>
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
