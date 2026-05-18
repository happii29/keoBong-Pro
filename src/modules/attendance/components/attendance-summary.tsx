import { CheckCircle2, Clock3, Goal, HelpCircle, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { AttendanceCounts } from "../attendance.types";

type AttendanceSummaryProps = {
  counts: AttendanceCounts;
};

export function AttendanceSummary({ counts }: AttendanceSummaryProps) {
  const responded = counts.total - counts.pending;
  const progress = counts.total ? Math.round((responded / counts.total) * 100) : 0;
  const available = counts.going + counts.late + counts.goalkeeper;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-4xl font-semibold">{progress}%</p>
            <p className="mt-1 text-sm text-muted-foreground">
              đã phản hồi · {available} người khả dụng
            </p>
          </div>
          <div className="rounded-xl border border-emerald/20 bg-emerald/10 px-3 py-2 text-sm font-semibold text-emerald">
            {responded}/{counts.total}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="flex h-2">
            <div
              className="bg-emerald"
              style={{ width: `${segmentPercent(counts.going, counts.total)}%` }}
            />
            <div
              className="bg-gold"
              style={{ width: `${segmentPercent(counts.late, counts.total)}%` }}
            />
            <div
              className="bg-gold/70"
              style={{
                width: `${segmentPercent(counts.goalkeeper, counts.total)}%`,
              }}
            />
            <div
              className="bg-destructive/80"
              style={{ width: `${segmentPercent(counts.absent, counts.total)}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <SummaryMetric icon={CheckCircle2} label="Đã đi" value={counts.going} tone="emerald" />
          <SummaryMetric icon={UserX} label="Nghỉ" value={counts.absent} tone="danger" />
          <SummaryMetric icon={HelpCircle} label="Chưa phản hồi" value={counts.pending} tone="slate" />
          <SummaryMetric icon={Clock3} label="Đến muộn" value={counts.late} tone="gold" />
          <SummaryMetric icon={Goal} label="Goalkeeper" value={counts.goalkeeper} tone="gold" className="col-span-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: "emerald" | "gold" | "danger" | "slate";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.035] p-3",
        tone === "emerald" && "border-emerald/20 text-emerald",
        tone === "gold" && "border-gold/20 text-gold",
        tone === "danger" && "border-destructive/25 text-destructive",
        tone === "slate" && "border-white/10 text-muted-foreground",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
        <Icon className="size-4" />
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function segmentPercent(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}
