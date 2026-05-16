import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: "emerald" | "gold" | "slate";
  variant?: "default" | "wide";
};

const toneStyles = {
  emerald: "border-emerald/20 bg-emerald/10 text-emerald shadow-emerald",
  gold: "border-gold/25 bg-gold/12 text-gold shadow-gold",
  slate: "border-white/12 bg-white/[0.055] text-foreground shadow-luxury",
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "emerald",
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "premium-card-hover h-full",
        variant === "wide" ? "min-h-32" : "min-h-[8.5rem]",
      )}
    >
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border",
            toneStyles[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-display text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
