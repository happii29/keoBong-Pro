import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Plus,
  Trophy,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { formatTeamSlug } from "@/lib/format";
import { routes } from "@/config/routes";

import { FundSummaryCard } from "./fund-summary-card";
import { MatchCard } from "./match-card";
import { QuickActionGrid } from "./quick-action-grid";
import { RankingPreview } from "./ranking-preview";
import { StatCard } from "./stat-card";
import { TeamSummary } from "./team-summary";

type DashboardOverviewProps = {
  teamSlug: string;
};

const upcomingMatch = {
  opponent: "FC Anh Em",
  dateLabel: "Thứ 7, 20:30",
  venue: "Sân Phú Thọ - Sân 3",
  format: "7v7",
  status: "Chờ chốt đội",
  confirmed: 12,
  pending: 5,
  declined: 2,
};

const rankingPlayers = [
  {
    rank: 1,
    name: "Minh Nguyễn",
    position: "ST",
    matches: 8,
    score: 8.7,
    trend: "+12%",
  },
  {
    rank: 2,
    name: "Quân Trần",
    position: "CM",
    matches: 7,
    score: 8.3,
    trend: "+8%",
  },
  {
    rank: 3,
    name: "Hưng Phạm",
    position: "GK",
    matches: 6,
    score: 8.1,
    trend: "+5%",
  },
];

export function DashboardOverview({ teamSlug }: DashboardOverviewProps) {
  const teamName = formatTeamSlug(teamSlug);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Team cockpit"
        title={teamName}
        description="Bức tranh vận hành trong ngày: lịch đá, điểm danh, quỹ đội, phong độ cầu thủ và các thao tác nhanh cho captain."
        action={
          <Button asChild variant="gold" size="lg">
            <Link href={routes.matches(teamSlug)}>
              <Plus className="size-4" />
              Tạo trận
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FadeIn delay={0}>
          <StatCard
            icon={CalendarDays}
            label="Trận sắp tới"
            value="20:30"
            detail="Thứ 7 tuần này"
            tone="gold"
          />
        </FadeIn>
        <FadeIn delay={0.03}>
          <StatCard
            icon={CheckCircle2}
            label="Điểm danh"
            value="12/19"
            detail="5 chưa phản hồi"
            tone="emerald"
          />
        </FadeIn>
        <FadeIn delay={0.06}>
          <StatCard
            icon={WalletCards}
            label="Quỹ đội"
            value="3.8tr"
            detail="+650k tháng này"
            tone="slate"
          />
        </FadeIn>
        <FadeIn delay={0.09}>
          <StatCard
            icon={Trophy}
            label="Top tháng"
            value="Minh"
            detail="8.7 rating"
            tone="gold"
          />
        </FadeIn>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-4">
          <MatchCard match={upcomingMatch} />
          <div className="grid gap-4 lg:grid-cols-2">
            <TeamSummary
              confirmed={upcomingMatch.confirmed}
              pending={upcomingMatch.pending}
              declined={upcomingMatch.declined}
              totalPlayers={19}
            />
            <FundSummaryCard
              balance="3.800.000đ"
              monthlyIncome="1.250.000đ"
              monthlyExpense="600.000đ"
              unpaidCount={4}
            />
          </div>
        </div>

        <div className="space-y-4">
          <QuickActionGrid teamSlug={teamSlug} />
          <RankingPreview players={rankingPlayers} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          icon={UsersRound}
          label="Đội hình khả dụng"
          value="16"
          detail="3 cầu thủ chấn thương / bận dài hạn"
          tone="emerald"
          variant="wide"
        />
        <StatCard
          icon={MessageCircle}
          label="Zalo workflow"
          value="Ready"
          detail="Sẵn sàng nối n8n webhook"
          tone="slate"
          variant="wide"
        />
        <StatCard
          icon={Clock3}
          label="Việc cần làm"
          value="3"
          detail="Chốt sân, gửi nhắc, kiểm tra quỹ"
          tone="gold"
          variant="wide"
        />
      </div>
    </section>
  );
}
