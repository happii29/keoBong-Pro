"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Goal, MapPin, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTeamSlug } from "@/lib/format";

import type { AttendancePlayer, AttendanceStatus } from "../attendance.types";
import { AttendanceButtonGroup } from "./attendance-button-group";
import { AttendanceList } from "./attendance-list";
import { AttendanceSummary } from "./attendance-summary";
import { ZaloMessagePreview } from "./zalo-message-preview";

type AttendanceModuleProps = {
  teamSlug: string;
};

const initialPlayers: AttendancePlayer[] = [
  { id: "p1", name: "Minh Nguyễn", position: "ST", shirtNumber: 9, status: "going" },
  { id: "p2", name: "Quân Trần", position: "CM", shirtNumber: 8, status: "going" },
  { id: "p3", name: "Hưng Phạm", position: "GK", shirtNumber: 1, status: "goalkeeper" },
  { id: "p4", name: "Long Lê", position: "CB", shirtNumber: 5, status: "late", note: "Tới muộn 15 phút" },
  { id: "p5", name: "Tuấn Anh", position: "LW", shirtNumber: 11, status: "absent" },
  { id: "p6", name: "Khải Võ", position: "RB", shirtNumber: 2, status: "pending" },
  { id: "p7", name: "Duy Hoàng", position: "DM", shirtNumber: 6, status: "pending" },
  { id: "p8", name: "Nam Phạm", position: "RW", shirtNumber: 7, status: "going" },
  { id: "p9", name: "Bảo Trần", position: "CB", shirtNumber: 4, status: "pending" },
  { id: "p10", name: "Khoa Đặng", position: "FW", shirtNumber: 10, status: "going" },
];

export function AttendanceModule({ teamSlug }: AttendanceModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const [players, setPlayers] = useState(initialPlayers);
  const [myStatus, setMyStatus] = useState<AttendanceStatus>("pending");

  const counts = useMemo(() => {
    return players.reduce(
      (acc, player) => {
        acc[player.status] += 1;
        acc.total += 1;
        return acc;
      },
      {
        going: 0,
        absent: 0,
        late: 0,
        goalkeeper: 0,
        pending: 0,
        total: 0,
      },
    );
  }, [players]);

  const handleMyStatusChange = (status: AttendanceStatus) => {
    setMyStatus(status);
    setPlayers((current) =>
      current.map((player) =>
        player.id === "p1"
          ? {
              ...player,
              status,
              note: status === "late" ? "Tới muộn 15 phút" : undefined,
            }
          : player,
      ),
    );
  };

  const handlePlayerStatusChange = (playerId: string, status: AttendanceStatus) => {
    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId
          ? {
              ...player,
              status,
              note: status === "late" ? "Tới muộn 15 phút" : undefined,
            }
          : player,
      ),
    );
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Attendance"
        title="Điểm danh trận sắp tới"
        description={`${teamName} · Thứ 7, 20:30 · Sân Phú Thọ - Sân 3`}
      />

      <Card className="overflow-hidden border-emerald/20 bg-emerald/8">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">Kèo 7v7</Badge>
                <Badge variant="glass">Chờ chốt đội</Badge>
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                KeoBong Pro vs FC Anh Em
              </h2>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-gold" />
                  Thứ 7, 20:30
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-emerald" />
                  Sân Phú Thọ - Sân 3
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald" />
                  Cần tối thiểu 12 người
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/10 px-4 py-3 text-gold">
              <Goal className="size-5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Goalkeeper
                </p>
                <p className="font-display text-xl font-semibold">
                  {counts.goalkeeper}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <AttendanceButtonGroup
            value={myStatus}
            onChange={handleMyStatusChange}
          />
          <AttendanceList
            players={players}
            onStatusChange={handlePlayerStatusChange}
          />
        </div>
        <div className="space-y-4">
          <AttendanceSummary counts={counts} />
          <ZaloMessagePreview players={players} counts={counts} />
        </div>
      </div>
    </section>
  );
}
