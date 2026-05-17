import {
  CalendarDays,
  Crown,
  LayoutDashboard,
  Scale,
  Settings2,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { routes } from "@/config/routes";
import type { WorkspaceNavItem } from "@/types/navigation";

export const workspaceNavigation: WorkspaceNavItem[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    shortLabel: "Tổng",
    href: routes.team,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    key: "matches",
    label: "Lịch thi đấu",
    shortLabel: "Lịch",
    href: routes.matches,
    icon: CalendarDays,
  },
  {
    key: "balance",
    label: "Chia đội",
    shortLabel: "Chia",
    href: routes.balance,
    icon: Scale,
  },
  {
    key: "ranking",
    label: "Ranking",
    shortLabel: "Rank",
    href: routes.ranking,
    icon: Crown,
  },
  {
    key: "players",
    label: "Đội hình",
    shortLabel: "Đội",
    href: routes.players,
    icon: UsersRound,
  },
  {
    key: "finance",
    label: "Quỹ đội",
    shortLabel: "Quỹ",
    href: routes.finance,
    icon: WalletCards,
  },
  {
    key: "settings",
    label: "Thiết lập",
    shortLabel: "Cài đặt",
    href: routes.settings,
    icon: Settings2,
  },
];
