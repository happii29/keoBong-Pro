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
import { routes } from "@/config/routes";
import { formatTeamSlug } from "@/lib/format";

import { FundSummaryCard } from "./fund-summary-card";
import { MatchCard } from "./match-card";
import { QuickActionGrid } from "./quick-action-grid";
import { RankingPreview } from "./ranking-preview";
import { StatCard } from "./stat-card";
import { TeamSummary } from "./team-summary";

export type DashboardMatch = {
  opponent: string;
  dateLabel: string;
  venue: string;
  format: string;
  status: string;
  confirmed: number;
  pending: number;
  declined: number;
  totalPlayers: number;
};

type DashboardOverviewProps = {
  teamSlug: string;
  upcomingMatch?: DashboardMatch;
  activePlayers: number;
  injuredPlayers: number;
};

const rankingPlayers = [
  {
    rank: 1,
    name: "Minh Nguyen",
    position: "ST",
    matches: 8,
    score: 8.7,
    trend: "+12%",
  },
  {
    rank: 2,
    name: "Quan Tran",
    position: "CM",
    matches: 7,
    score: 8.3,
    trend: "+8%",
  },
  {
    rank: 3,
    name: "Hung Pham",
    position: "GK",
    matches: 6,
    score: 8.1,
    trend: "+5%",
  },
];

export function DashboardOverview({
  teamSlug,
  upcomingMatch,
  activePlayers,
  injuredPlayers,
}: DashboardOverviewProps) {
  const teamName = formatTeamSlug(teamSlug);
  const match = upcomingMatch ?? {
    opponent: "Chua co tran sap toi",
    dateLabel: "Tao tran moi",
    venue: "Chua chon san",
    format: "-",
    status: "No match",
    confirmed: 0,
    pending: activePlayers,
    declined: 0,
    totalPlayers: activePlayers,
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Team cockpit"
        title={teamName}
        description="Buc tranh van hanh trong ngay: lich da, diem danh, quy doi, phong do cau thu va cac thao tac nhanh cho captain."
        action={
          <Button asChild variant="gold" size="lg">
            <Link href={routes.matches(teamSlug)}>
              <Plus className="size-4" />
              Tao tran
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FadeIn delay={0}>
          <StatCard
            icon={CalendarDays}
            label="Tran sap toi"
            value={upcomingMatch ? match.dateLabel.split(",").at(-1)?.trim() ?? match.dateLabel : "-"}
            detail={upcomingMatch ? match.dateLabel : "Chua co lich"}
            tone="gold"
          />
        </FadeIn>
        <FadeIn delay={0.03}>
          <StatCard
            icon={CheckCircle2}
            label="Diem danh"
            value={`${match.confirmed}/${match.totalPlayers}`}
            detail={`${match.pending} chua phan hoi`}
            tone="emerald"
          />
        </FadeIn>
        <FadeIn delay={0.06}>
          <StatCard
            icon={WalletCards}
            label="Quy doi"
            value="3.8tr"
            detail="+650k thang nay"
            tone="slate"
          />
        </FadeIn>
        <FadeIn delay={0.09}>
          <StatCard
            icon={Trophy}
            label="Top thang"
            value="Minh"
            detail="8.7 rating"
            tone="gold"
          />
        </FadeIn>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-4">
          <MatchCard match={match} />
          <div className="grid gap-4 lg:grid-cols-2">
            <TeamSummary
              confirmed={match.confirmed}
              pending={match.pending}
              declined={match.declined}
              totalPlayers={Math.max(match.totalPlayers, 1)}
            />
            <FundSummaryCard
              balance="3.800.000d"
              monthlyIncome="1.250.000d"
              monthlyExpense="600.000d"
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
          label="Doi hinh kha dung"
          value={activePlayers.toString()}
          detail={`${injuredPlayers} cau thu chan thuong / inactive`}
          tone="emerald"
          variant="wide"
        />
        <StatCard
          icon={MessageCircle}
          label="Zalo workflow"
          value="Ready"
          detail="San sang noi n8n webhook"
          tone="slate"
          variant="wide"
        />
        <StatCard
          icon={Clock3}
          label="Viec can lam"
          value={upcomingMatch && match.pending > 0 ? "1" : "0"}
          detail={upcomingMatch && match.pending > 0 ? "Nhac nguoi chua diem danh" : "Khong co viec gap"}
          tone="gold"
          variant="wide"
        />
      </div>
    </section>
  );
}
