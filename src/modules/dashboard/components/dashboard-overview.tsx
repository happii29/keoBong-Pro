import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
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

export type DashboardFundSummary = {
  balance: string;
  monthlyIncome: string;
  monthlyExpense: string;
  debt: string;
  unpaidCount: number;
};

export type DashboardRankingPlayer = {
  rank: number;
  name: string;
  position: string;
  matches: number;
  score: number;
  trend: string;
};

export type DashboardTask = {
  title: string;
  href: string;
  tone: "gold" | "emerald";
};

type DashboardOverviewProps = {
  teamSlug: string;
  upcomingMatch?: DashboardMatch;
  activePlayers: number;
  injuredPlayers: number;
  fundSummary: DashboardFundSummary;
  rankingPlayers: DashboardRankingPlayer[];
  tasks: DashboardTask[];
  hasPlayers: boolean;
  hasTransactions: boolean;
};

export function DashboardOverview({
  teamSlug,
  upcomingMatch,
  activePlayers,
  injuredPlayers,
  fundSummary,
  rankingPlayers,
  tasks,
  hasPlayers,
  hasTransactions,
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
  const topPlayer = rankingPlayers[0];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Team cockpit"
        title={teamName}
        description="Tong quan van hanh: lich da, diem danh, quy doi, phong do cau thu va viec can lam."
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
            value={fundSummary.balance}
            detail={`${fundSummary.debt} cong no`}
            tone="slate"
          />
        </FadeIn>
        <FadeIn delay={0.09}>
          <StatCard
            icon={Trophy}
            label="Top thang"
            value={topPlayer?.name.split(" ").at(-1) ?? "-"}
            detail={topPlayer ? `${topPlayer.score} diem` : "Chua co stats"}
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
              balance={fundSummary.balance}
              monthlyIncome={fundSummary.monthlyIncome}
              monthlyExpense={fundSummary.monthlyExpense}
              unpaidCount={fundSummary.unpaidCount}
            />
          </div>
        </div>

        <div className="space-y-4">
          <QuickActionGrid teamSlug={teamSlug} />
          {rankingPlayers.length ? (
            <RankingPreview players={rankingPlayers} />
          ) : (
            <EmptyPanel
              title="Chua co ranking thang nay"
              description="Nhap ket qua tran va stats cau thu de dashboard tu hien top player."
              href={routes.ranking(teamSlug)}
              action="Nhap stats"
            />
          )}
        </div>
      </div>

      {!upcomingMatch || !hasPlayers || !hasTransactions ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {!hasPlayers ? (
            <EmptyPanel
              title="Chua co cau thu"
              description="Them danh sach cau thu de dung diem danh, chia doi va ranking."
              href={routes.players(teamSlug)}
              action="Them cau thu"
            />
          ) : null}
          {!upcomingMatch ? (
            <EmptyPanel
              title="Chua co tran sap toi"
              description="Tao tran moi de doi bat dau diem danh va tinh quy."
              href={routes.matches(teamSlug)}
              action="Tao tran"
            />
          ) : null}
          {!hasTransactions ? (
            <EmptyPanel
              title="Chua co giao dich quy"
              description="Them khoan thu/chi dau tien de theo doi so du doi."
              href={routes.finance(teamSlug)}
              action="Them thu/chi"
            />
          ) : null}
        </div>
      ) : null}

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
          value={tasks.length.toString()}
          detail={tasks[0]?.title ?? "Khong co viec gap"}
          tone="gold"
          variant="wide"
        />
      </div>

      {tasks.length ? <TaskList tasks={tasks} /> : null}
    </section>
  );
}

function EmptyPanel({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.035] p-5">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <Button asChild variant="luxury" className="mt-4">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}

function TaskList({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2">
        <ListChecks className="size-5 text-gold" />
        <p className="font-display text-lg font-semibold">Viec can lam</p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {tasks.map((task) => (
          <Link
            key={task.title}
            href={task.href}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold transition hover:border-emerald/30 hover:bg-white/[0.065]"
          >
            {task.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
