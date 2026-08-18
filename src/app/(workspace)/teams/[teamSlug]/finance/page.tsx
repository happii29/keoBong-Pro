import { FundManagementModule } from "@/modules/finance/components/fund-management-module";
import type {
  FinanceMatch,
  FinancePlayer,
  FinanceTransaction,
  MatchPaymentSummary,
} from "@/modules/finance/finance.types";
import { requireTeamWorkspaceAccess } from "@/modules/auth/guards";

type FinancePageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

const attendanceStatuses = ["going", "late", "goalkeeper"] as const;
const managerRoles = new Set(["owner", "manager", "captain"]);

function formatMatchLabel(match: FinanceMatch) {
  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(match.starts_at));

  return `${date} - ${match.opponent_name || "Chưa có đối thủ"}`;
}

export default async function FinancePage({ params }: FinancePageProps) {
  const { teamSlug } = await params;
  const { supabase, team, user } = await requireTeamWorkspaceAccess(teamSlug);

  const [{ data: membership }, { data: playerRows }, { data: matchRows }, { data: transactionRows }] =
    await Promise.all([
      supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("players")
        .select("id, display_name, shirt_number, user_id, status")
        .eq("team_id", team.id)
        .order("display_name", { ascending: true }),
      supabase
        .from("matches")
        .select("id, opponent_name, venue_name, starts_at, status")
        .eq("team_id", team.id)
        .neq("status", "cancelled")
        .order("starts_at", { ascending: false })
        .limit(20),
      supabase
        .from("fund_transactions")
        .select("*")
        .eq("team_id", team.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

  const role = membership?.role ?? "viewer";
  const canManage = managerRoles.has(role);
  const players = (playerRows ?? []) as FinancePlayer[];
  const matches = (matchRows ?? []) as FinanceMatch[];
  const rawTransactions = transactionRows ?? [];
  const matchIds = matches.map((match) => match.id);

  const { data: attendanceRows } = matchIds.length
    ? await supabase
        .from("attendance")
        .select("match_id, player_id, status")
        .eq("team_id", team.id)
        .in("match_id", matchIds)
        .in("status", [...attendanceStatuses])
    : { data: [] };

  const playersById = new Map(players.map((player) => [player.id, player]));
  const matchesById = new Map(matches.map((match) => [match.id, match]));
  const currentUserPlayerIds = new Set(players.filter((player) => player.user_id === user.id).map((player) => player.id));

  const transactions: FinanceTransaction[] = rawTransactions.map((transaction) => {
    const linkedMatch = transaction.match_id ? matchesById.get(transaction.match_id) : null;

    return {
      ...transaction,
      matchLabel: linkedMatch ? formatMatchLabel(linkedMatch) : null,
      playerName: transaction.player_id ? playersById.get(transaction.player_id)?.display_name ?? null : null,
    };
  });

  const eligiblePlayersByMatchId = new Map<string, Set<string>>();

  for (const attendance of attendanceRows ?? []) {
    if (!eligiblePlayersByMatchId.has(attendance.match_id)) {
      eligiblePlayersByMatchId.set(attendance.match_id, new Set());
    }

    eligiblePlayersByMatchId.get(attendance.match_id)?.add(attendance.player_id);
  }

  const matchPaymentSummaries: MatchPaymentSummary[] = matches
    .map((match) => {
      const eligiblePlayerIds = [...(eligiblePlayersByMatchId.get(match.id) ?? new Set<string>())].filter((playerId) =>
        playersById.has(playerId),
      );
      const matchTransactions = rawTransactions.filter((transaction) => transaction.match_id === match.id);
      const totalExpense = matchTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
      const duePerPlayer = eligiblePlayerIds.length ? Math.ceil(totalExpense / eligiblePlayerIds.length) : 0;

      const paymentPlayers = eligiblePlayerIds
        .map((playerId) => {
          const player = playersById.get(playerId);
          const paidAmount = matchTransactions
            .filter((transaction) => transaction.type === "income" && transaction.player_id === playerId)
            .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);

          return {
            playerId,
            name: player?.display_name ?? "Cầu thủ",
            shirtNumber: player?.shirt_number ?? null,
            paidAmount,
            dueAmount: duePerPlayer,
            debtAmount: Math.max(0, duePerPlayer - paidAmount),
            isCurrentUser: currentUserPlayerIds.has(playerId),
          };
        })
        .filter((player) => canManage || player.isCurrentUser);

      return {
        matchId: match.id,
        matchLabel: formatMatchLabel(match),
        startsAt: match.starts_at,
        totalExpense,
        duePerPlayer,
        paidTotal: paymentPlayers.reduce((sum, player) => sum + player.paidAmount, 0),
        debtTotal: paymentPlayers.reduce((sum, player) => sum + player.debtAmount, 0),
        players: paymentPlayers,
      };
    })
    .filter((summary) => summary.players.length > 0 || canManage);

  return (
    <FundManagementModule
      teamSlug={teamSlug}
      role={role}
      currentUserId={user.id}
      players={players}
      matches={matches}
      transactions={transactions}
      matchPaymentSummaries={matchPaymentSummaries}
    />
  );
}
