import { ArrowDownRight, ArrowUpRight, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FundSummaryCardProps = {
  balance: string;
  monthlyIncome: string;
  monthlyExpense: string;
  unpaidCount: number;
};

export function FundSummaryCard({
  balance,
  monthlyIncome,
  monthlyExpense,
  unpaidCount,
}: FundSummaryCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Quỹ đội</CardTitle>
          <Badge variant="emerald">Healthy</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/12 text-gold shadow-gold">
            <WalletCards className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
            <p className="font-display text-3xl font-semibold">{balance}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <FundMetric
            icon={ArrowUpRight}
            label="Thu tháng này"
            value={monthlyIncome}
            tone="emerald"
          />
          <FundMetric
            icon={ArrowDownRight}
            label="Chi tháng này"
            value={monthlyExpense}
            tone="gold"
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{unpaidCount}</span>{" "}
          thành viên chưa đóng quỹ tháng này.
        </div>
      </CardContent>
    </Card>
  );
}

function FundMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "emerald" | "gold";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={tone === "emerald" ? "size-4 text-emerald" : "size-4 text-gold"} />
        {label}
      </div>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
