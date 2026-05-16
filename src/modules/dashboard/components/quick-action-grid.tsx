import Link from "next/link";
import {
  Bot,
  CalendarPlus,
  MessageCircle,
  ReceiptText,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

type QuickActionGridProps = {
  teamSlug: string;
};

export function QuickActionGrid({ teamSlug }: QuickActionGridProps) {
  const actions = [
    {
      label: "Tạo trận",
      icon: CalendarPlus,
      href: routes.matches(teamSlug),
      accent: "gold",
    },
    {
      label: "Gọi điểm danh",
      icon: MessageCircle,
      href: routes.matches(teamSlug),
      accent: "emerald",
    },
    {
      label: "Thêm cầu thủ",
      icon: UserPlus,
      href: routes.players(teamSlug),
      accent: "emerald",
    },
    {
      label: "Thu quỹ",
      icon: ReceiptText,
      href: routes.finance(teamSlug),
      accent: "gold",
    },
    {
      label: "Chia đội AI",
      icon: Bot,
      href: routes.matches(teamSlug),
      accent: "emerald",
    },
    {
      label: "Đội hình",
      icon: UsersRound,
      href: routes.players(teamSlug),
      accent: "slate",
    },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/30 hover:bg-white/[0.065]"
              >
                <div
                  className={cn(
                    "mb-3 flex size-10 items-center justify-center rounded-lg border",
                    action.accent === "gold"
                      ? "border-gold/25 bg-gold/12 text-gold"
                      : action.accent === "emerald"
                        ? "border-emerald/20 bg-emerald/10 text-emerald"
                        : "border-white/12 bg-white/[0.055] text-foreground",
                  )}
                >
                  <Icon className="size-4 transition-transform group-hover:scale-110" />
                </div>
                <p className="text-sm font-semibold leading-5">{action.label}</p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
