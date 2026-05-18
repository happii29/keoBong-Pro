import { Clock3, Goal, HelpCircle, UserX, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { AttendancePlayer, AttendanceStatus } from "../attendance.types";

type AttendanceListProps = {
  players: AttendancePlayer[];
  onStatusChange: (playerId: string, status: AttendanceStatus) => void;
};

const statusLabels: Record<AttendanceStatus, string> = {
  going: "Đã đi",
  absent: "Nghỉ",
  late: "Đến muộn",
  goalkeeper: "Goalkeeper",
  pending: "Chưa phản hồi",
};

const statusIcons = {
  going: CheckCircle2,
  absent: UserX,
  late: Clock3,
  goalkeeper: Goal,
  pending: HelpCircle,
} satisfies Record<AttendanceStatus, LucideIcon>;

export function AttendanceList({ players, onStatusChange }: AttendanceListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Attendance list</CardTitle>
          <Badge variant="glass">{players.length} cầu thủ</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PlayerRow({
  player,
  onStatusChange,
}: {
  player: AttendancePlayer;
  onStatusChange: (playerId: string, status: AttendanceStatus) => void;
}) {
  const Icon = statusIcons[player.status];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-all duration-200 hover:border-emerald/25 hover:bg-white/[0.06]">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] font-display text-sm font-semibold">
          {player.shirtNumber}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{player.name}</p>
            <span className="rounded-md bg-white/[0.055] px-2 py-0.5 text-xs text-muted-foreground">
              {player.position}
            </span>
          </div>
          {player.note ? (
            <p className="mt-1 text-xs text-gold">{player.note}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold",
            player.status === "going" && "border-emerald/20 bg-emerald/10 text-emerald",
            player.status === "goalkeeper" && "border-gold/20 bg-gold/10 text-gold",
            player.status === "late" && "border-gold/20 bg-gold/10 text-gold",
            player.status === "absent" && "border-destructive/25 bg-destructive/10 text-destructive",
            player.status === "pending" && "border-white/10 bg-white/[0.04] text-muted-foreground",
          )}
        >
          <Icon className="size-3.5" />
          {statusLabels[player.status]}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {(["going", "absent", "late", "goalkeeper"] as const).map((status) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={player.status === status ? "emerald" : "ghost"}
            className={cn(
              "h-8 px-2 text-[11px]",
              player.status === status &&
                (status === "absent"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : status === "late" || status === "goalkeeper"
                    ? "bg-gold text-gold-foreground hover:bg-gold/90"
                    : undefined),
            )}
            onClick={() => onStatusChange(player.id, status)}
          >
            {statusLabels[status].replace("Đã đi", "Đi")}
          </Button>
        ))}
      </div>
    </div>
  );
}
