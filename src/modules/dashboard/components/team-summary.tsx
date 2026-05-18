import { CheckCircle2, Clock3, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TeamSummaryProps = {
  confirmed: number;
  pending: number;
  declined: number;
  totalPlayers: number;
};

export function TeamSummary({
  confirmed,
  pending,
  declined,
  totalPlayers,
}: TeamSummaryProps) {
  const confirmedPercent = Math.round((confirmed / totalPlayers) * 100);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Attendance summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-4xl font-semibold">
              {confirmedPercent}%
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              đã xác nhận đi đá
            </p>
          </div>
          <div className="rounded-xl border border-emerald/20 bg-emerald/10 px-3 py-2 text-sm font-semibold text-emerald">
            {confirmed}/{totalPlayers}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-emerald shadow-emerald"
            style={{ width: `${confirmedPercent}%` }}
          />
        </div>

        <div className="mt-5 grid gap-2">
          <SummaryRow icon={CheckCircle2} label="Đi đá" value={confirmed} />
          <SummaryRow icon={Clock3} label="Chưa phản hồi" value={pending} />
          <SummaryRow icon={UserX} label="Bận" value={declined} />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-emerald" />
        {label}
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
