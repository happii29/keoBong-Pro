import { RankingModule } from "@/modules/ranking/components/ranking-module";
import type {
  RankingMatchInput,
  RankingPlayer,
  RankingStatPlayer,
} from "@/modules/ranking/ranking.types";
import { requireTeamWorkspaceAccess } from "@/modules/auth/guards";

type RankingPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

const attendanceStatuses = ["going", "late", "goalkeeper"] as const;
const managerRoles = new Set(["owner", "manager", "captain"]);

function formatMatchLabel(match: {
  opponent_name: string | null;
  starts_at: string;
}) {
  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(match.starts_at));

  return `${date} - ${match.opponent_name || "Chưa có đối thủ"}`;
}

export default async function RankingPage({ params }: RankingPageProps) {
  const { teamSlug } = await params;
  const { supabase, team, user } = await requireTeamWorkspaceAccess(teamSlug);

  const [{ data: membership }, { data: playerRows }, { data: matchRows }, { data: statRows }] =
    await Promise.all([
      supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("players")
        .select("id, display_name, shirt_number, position, status")
        .eq("team_id", team.id)
        .order("display_name", { ascending: true }),
      supabase
        .from("matches")
        .select("id, opponent_name, starts_at, status, team_score, opponent_score")
        .eq("team_id", team.id)
        .neq("status", "cancelled")
        .order("starts_at", { ascending: false })
        .limit(100),
      supabase
        .from("player_stats")
        .select("match_id, player_id, goals, assists, mvp")
        .eq("team_id", team.id),
    ]);

  const role = membership?.role ?? "viewer";
  const canManage = managerRoles.has(role);
  const players = playerRows ?? [];
  const matches = matchRows ?? [];
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
  const statsByPlayerId = new Map<string, { goals: number; assists: number; mvp: number }>();
  const attendanceByPlayerId = new Map<string, Set<string>>();
  const winsByPlayerId = new Map<string, number>();
  const resultMatches = matches.filter(
    (match) => match.status === "completed" && match.team_score !== null && match.opponent_score !== null,
  );
  const resultMatchIds = new Set(resultMatches.map((match) => match.id));
  const wonMatchIds = new Set(
    resultMatches
      .filter((match) => Number(match.team_score) > Number(match.opponent_score))
      .map((match) => match.id),
  );

  for (const stat of statRows ?? []) {
    const current = statsByPlayerId.get(stat.player_id) ?? { goals: 0, assists: 0, mvp: 0 };
    current.goals += stat.goals;
    current.assists += stat.assists;
    current.mvp += stat.mvp ? 1 : 0;
    statsByPlayerId.set(stat.player_id, current);
  }

  for (const attendance of attendanceRows ?? []) {
    if (!attendanceByPlayerId.has(attendance.player_id)) {
      attendanceByPlayerId.set(attendance.player_id, new Set());
    }

    attendanceByPlayerId.get(attendance.player_id)?.add(attendance.match_id);

    if (wonMatchIds.has(attendance.match_id)) {
      winsByPlayerId.set(attendance.player_id, (winsByPlayerId.get(attendance.player_id) ?? 0) + 1);
    }
  }

  const rankingPlayers = players
    .map((player) => {
      const stats = statsByPlayerId.get(player.id) ?? { goals: 0, assists: 0, mvp: 0 };
      const attendedMatches = attendanceByPlayerId.get(player.id) ?? new Set<string>();
      const resultAppearances = [...attendedMatches].filter((matchId) => resultMatchIds.has(matchId)).length;
      const attendance = resultMatches.length ? Math.round((resultAppearances / resultMatches.length) * 100) : 0;
      const winRate = resultAppearances ? Math.round(((winsByPlayerId.get(player.id) ?? 0) / resultAppearances) * 100) : 0;
      const rating = Math.min(
        99,
        Math.round(45 + stats.goals * 4 + stats.assists * 3 + stats.mvp * 6 + attendance * 0.18 + winRate * 0.12),
      );

      return {
        id: player.id,
        rank: 0,
        name: player.display_name,
        position: player.position ?? "-",
        shirtNumber: player.shirt_number ?? 0,
        goals: stats.goals,
        assists: stats.assists,
        mvp: stats.mvp,
        attendance,
        winRate,
        rating,
        form: rating >= 85 ? "hot" : rating >= 72 ? "up" : "steady",
      } satisfies RankingPlayer;
    })
    .sort(
      (a, b) =>
        b.rating - a.rating ||
        b.goals - a.goals ||
        b.assists - a.assists ||
        b.mvp - a.mvp ||
        a.name.localeCompare(b.name),
    )
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const statsByMatchAndPlayerId = new Map<string, { goals: number; assists: number; mvp: boolean }>();

  for (const stat of statRows ?? []) {
    statsByMatchAndPlayerId.set(`${stat.match_id}:${stat.player_id}`, {
      goals: stat.goals,
      assists: stat.assists,
      mvp: stat.mvp,
    });
  }

  const eligiblePlayerIdsByMatchId = new Map<string, Set<string>>();

  for (const attendance of attendanceRows ?? []) {
    if (!eligiblePlayerIdsByMatchId.has(attendance.match_id)) {
      eligiblePlayerIdsByMatchId.set(attendance.match_id, new Set());
    }

    eligiblePlayerIdsByMatchId.get(attendance.match_id)?.add(attendance.player_id);
  }

  const activePlayerIds = players.filter((player) => player.status === "active").map((player) => player.id);
  const statMatches: RankingMatchInput[] = matches.map((match) => {
    const participantIds = [...(eligiblePlayerIdsByMatchId.get(match.id) ?? new Set<string>())];
    const playerIds = participantIds.length ? participantIds : activePlayerIds;
    const statPlayers: RankingStatPlayer[] = playerIds
      .filter((playerId) => playersById.has(playerId))
      .map((playerId) => {
        const player = playersById.get(playerId);
        const stats = statsByMatchAndPlayerId.get(`${match.id}:${playerId}`) ?? {
          goals: 0,
          assists: 0,
          mvp: false,
        };

        return {
          id: playerId,
          name: player?.display_name ?? "Cầu thủ",
          shirtNumber: player?.shirt_number ?? null,
          position: player?.position ?? null,
          goals: stats.goals,
          assists: stats.assists,
          mvp: stats.mvp,
        };
      });

    return {
      id: match.id,
      label: formatMatchLabel(match),
      startsAt: match.starts_at,
      status: match.status,
      teamScore: match.team_score,
      opponentScore: match.opponent_score,
      players: statPlayers,
    };
  });

  return (
    <RankingModule
      teamSlug={teamSlug}
      role={role}
      players={rankingPlayers}
      matches={statMatches}
      canManage={canManage}
    />
  );
}
