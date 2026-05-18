import { CalendarDays, MapPin, Shield, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MatchCardProps = {
  match: {
    opponent: string;
    dateLabel: string;
    venue: string;
    format: string;
    status: string;
    confirmed: number;
    pending: number;
    declined: number;
  };
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="gold">Trận sắp tới</Badge>
            <CardTitle className="mt-3 text-2xl">{match.opponent}</CardTitle>
          </div>
          <Badge variant="glass">{match.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          <MatchMeta icon={CalendarDays} label="Thời gian" value={match.dateLabel} />
          <MatchMeta icon={MapPin} label="Địa điểm" value={match.venue} />
          <MatchMeta icon={Shield} label="Thể thức" value={match.format} />
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UsersRound className="size-4 text-emerald" />
              Attendance
            </div>
            <span className="text-xs text-muted-foreground">
              {match.confirmed + match.pending + match.declined} thành viên
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <AttendancePill label="Đi" value={match.confirmed} tone="emerald" />
            <AttendancePill label="Chờ" value={match.pending} tone="gold" />
            <AttendancePill label="Bận" value={match.declined} tone="slate" />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button variant="gold" className="sm:flex-1">
            Chốt đội hình
          </Button>
          <Button variant="luxury" className="sm:flex-1">
            Nhắc Zalo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium leading-6">{value}</p>
    </div>
  );
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
      ? "text-emerald bg-emerald/10 border-emerald/20"
      : tone === "gold"
        ? "text-gold bg-gold/10 border-gold/20"
        : "text-foreground bg-white/[0.045] border-white/10";

  return (
    <div className={`rounded-lg border p-3 text-center ${toneClass}`}>
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-medium">{label}</p>
    </div>
  );
}
