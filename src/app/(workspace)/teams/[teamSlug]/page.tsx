import {
  DashboardOverview,
  type DashboardFundSummary,
  type DashboardMatch,
  type DashboardRankingPlayer,
  type DashboardTask,
} from "@/modules/dashboard/components/dashboard-overview";
import { requireTeamWorkspaceAccess } from "@/modules/auth/guards";

type TeamDashboardPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

const attendanceGoingStatuses = ["going", "late", "goalkeeper"] as const;

function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function TeamDashboardPage({
  params,
}: TeamDashboardPageProps) {
  const { teamSlug } = await params;
  const { supabase, team } = await requireTeamWorkspaceAccess(teamSlug);
  const now = new Date();
  const nowIso = now.toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: players },
    { data: nextMatch },
    { data: recentMatches },
    { data: fundTransactions },
    { data: playerStats },
  ] = await Promise.all([
    supabase
      .from("players")
      .select("id, display_name, position, shirt_number, status")
      .eq("team_id", team.id)
      .neq("status", "left"),
    supabase
      .from("matches")
      .select("*")
      .eq("team_id", team.id)
      .gte("starts_at", nowIso)
      .not("status", "in", "(completed,cancelled)")
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("matches")
      .select("id, opponent_name, starts_at, status, team_score, opponent_score")
      .eq("team_id", team.id)
      .neq("status", "cancelled")
      .order("starts_at", { ascending: false })
      .limit(40),
    supabase
      .from("fund_transactions")
      .select("id, match_id, player_id, type, amount_vnd, transaction_date")
      .eq("team_id", team.id),
    supabase
      .from("player_stats")
      .select("match_id, player_id, goals, assists, mvp")
      .eq("team_id", team.id),
  ]);

  const playerRows = players ?? [];
  const matchRows = recentMatches ?? [];
  const transactionRows = fundTransactions ?? [];
  const activePlayers = playerRows.filter((player) => player.status === "active").length;
  const injuredPlayers = playerRows.filter(
    (player) => player.status === "injured" || player.status === "inactive",
  ).length;

  let upcomingMatch: DashboardMatch | undefined;
  let pendingAttendance = 0;

  if (nextMatch) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("player_id, status")
      .eq("team_id", team.id)
      .eq("match_id", nextMatch.id);

    const attendanceByPlayer = new Map(
      (attendance ?? []).map((item) => [item.player_id, item.status]),
    );
    const confirmed = playerRows.filter((player) => {
      const status = attendanceByPlayer.get(player.id) ?? "pending";

      return attendanceGoingStatuses.includes(status as (typeof attendanceGoingStatuses)[number]);
    }).length;
    const declined = playerRows.filter(
      (player) => (attendanceByPlayer.get(player.id) ?? "pending") === "absent",
    ).length;
    pendingAttendance = Math.max(playerRows.length - confirmed - declined, 0);

    upcomingMatch = {
      opponent: nextMatch.opponent_name ?? "Trận nội bộ",
      dateLabel: formatDashboardDate(nextMatch.starts_at),
      venue: nextMatch.venue_name ?? "Chưa chọn sân",
      format: nextMatch.format,
      status: nextMatch.status,
      confirmed,
      declined,
      pending: pendingAttendance,
      totalPlayers: playerRows.length,
    };
  }

  const totalIncome = transactionRows
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
  const totalExpense = transactionRows
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
  const monthlyIncome = transactionRows
    .filter((transaction) => transaction.type === "income" && transaction.transaction_date >= monthStart.slice(0, 10))
    .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
  const monthlyExpense = transactionRows
    .filter((transaction) => transaction.type === "expense" && transaction.transaction_date >= monthStart.slice(0, 10))
    .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);

  const matchIds = matchRows.map((match) => match.id);
  const { data: attendanceRows } = matchIds.length
    ? await supabase
        .from("attendance")
        .select("match_id, player_id, status")
        .eq("team_id", team.id)
        .in("match_id", matchIds)
        .in("status", [...attendanceGoingStatuses])
    : { data: [] };

  const participantsByMatchId = new Map<string, Set<string>>();
  for (const attendance of attendanceRows ?? []) {
    if (!participantsByMatchId.has(attendance.match_id)) {
      participantsByMatchId.set(attendance.match_id, new Set());
    }
    participantsByMatchId.get(attendance.match_id)?.add(attendance.player_id);
  }

  let totalDebt = 0;
  let unpaidCount = 0;
  for (const match of matchRows) {
    const participantIds = [...(participantsByMatchId.get(match.id) ?? new Set<string>())];
    if (!participantIds.length) {
      continue;
    }

    const matchTransactions = transactionRows.filter((transaction) => transaction.match_id === match.id);
    const matchExpense = matchTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
    const duePerPlayer = matchExpense ? Math.ceil(matchExpense / participantIds.length) : 0;

    for (const playerId of participantIds) {
      const paid = matchTransactions
        .filter((transaction) => transaction.type === "income" && transaction.player_id === playerId)
        .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
      const debt = Math.max(0, duePerPlayer - paid);

      if (debt > 0) {
        unpaidCount += 1;
        totalDebt += debt;
      }
    }
  }

  const fundSummary: DashboardFundSummary = {
    balance: formatCurrency(totalIncome - totalExpense),
    monthlyIncome: formatCurrency(monthlyIncome),
    monthlyExpense: formatCurrency(monthlyExpense),
    debt: formatCurrency(totalDebt),
    unpaidCount,
  };

  const playersById = new Map(playerRows.map((player) => [player.id, player]));
  const monthMatchIds = new Set(
    matchRows
      .filter((match) => match.starts_at >= monthStart)
      .map((match) => match.id),
  );
  const statsByPlayerId = new Map<string, { goals: number; assists: number; mvp: number; matches: Set<string> }>();

  for (const stat of playerStats ?? []) {
    if (!monthMatchIds.has(stat.match_id)) {
      continue;
    }

    const current = statsByPlayerId.get(stat.player_id) ?? {
      goals: 0,
      assists: 0,
      mvp: 0,
      matches: new Set<string>(),
    };
    current.goals += stat.goals;
    current.assists += stat.assists;
    current.mvp += stat.mvp ? 1 : 0;
    current.matches.add(stat.match_id);
    statsByPlayerId.set(stat.player_id, current);
  }

  const rankingPlayers: DashboardRankingPlayer[] = [...statsByPlayerId.entries()]
    .map(([playerId, stats]) => {
      const player = playersById.get(playerId);
      const score = Number((stats.goals * 1.8 + stats.assists * 1.2 + stats.mvp * 2.5 + stats.matches.size).toFixed(1));

      return {
        rank: 0,
        name: player?.display_name ?? "Cầu thủ",
        position: player?.position ?? "-",
        matches: stats.matches.size,
        score,
        trend: `${stats.goals}G ${stats.assists}A`,
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const tasks: DashboardTask[] = [];
  if (!playerRows.length) {
    tasks.push({ title: "Thêm cầu thủ đầu tiên", href: `/teams/${team.slug}/players`, tone: "gold" });
  }
  if (!upcomingMatch) {
    tasks.push({ title: "Tạo trận sắp tới", href: `/teams/${team.slug}/matches`, tone: "emerald" });
  }
  if (upcomingMatch && pendingAttendance > 0) {
    tasks.push({ title: `Nhắc ${pendingAttendance} người chưa phản hồi`, href: `/teams/${team.slug}/matches`, tone: "gold" });
  }
  if (totalDebt > 0) {
    tasks.push({ title: `Thu công nợ ${formatCurrency(totalDebt)}`, href: `/teams/${team.slug}/finance`, tone: "gold" });
  }
  if (!rankingPlayers.length && matchRows.some((match) => match.status === "completed")) {
    tasks.push({ title: "Nhập stats sau trận", href: `/teams/${team.slug}/ranking`, tone: "emerald" });
  }

  return (
    <DashboardOverview
      teamSlug={team.slug}
      upcomingMatch={upcomingMatch}
      activePlayers={activePlayers}
      injuredPlayers={injuredPlayers}
      fundSummary={fundSummary}
      rankingPlayers={rankingPlayers}
      tasks={tasks.slice(0, 4)}
      hasPlayers={playerRows.length > 0}
      hasTransactions={transactionRows.length > 0}
    />
  );
}
