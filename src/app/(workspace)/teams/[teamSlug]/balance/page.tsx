import { TeamBalancingModule } from "@/modules/team-balancing/components/team-balancing-module";
import type { BalanceMatchOption, BalancePlayer, PlayerPosition } from "@/modules/team-balancing/team-balancing.types";
import { requireTeamWorkspaceAccess } from "@/modules/auth/guards";
import type { Enums } from "@/services/supabase";

type BalancePageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
  searchParams?: Promise<{
    matchId?: string;
  }>;
};

const attendanceStatuses = ["going", "late", "goalkeeper"] as const satisfies Enums<"attendance_status">[];
const validPositions = new Set<PlayerPosition>(["GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST"]);

function normalizePosition(position: string | null): PlayerPosition {
  return validPositions.has(position as PlayerPosition) ? (position as PlayerPosition) : "CM";
}

export default async function BalancePage({ params, searchParams }: BalancePageProps) {
  const { teamSlug } = await params;
  const { matchId } = (await searchParams) ?? {};
  const { supabase, team } = await requireTeamWorkspaceAccess(teamSlug);

  const { data: matchRows } = await supabase
    .from("matches")
    .select("id, opponent_name, venue_name, starts_at, status")
    .eq("team_id", team.id)
    .neq("status", "cancelled")
    .order("starts_at", { ascending: true });

  const matches: BalanceMatchOption[] = (matchRows ?? []).map((match) => ({
    id: match.id,
    opponentName: match.opponent_name,
    venueName: match.venue_name,
    startsAt: match.starts_at,
    status: match.status,
  }));

  const selectedMatch =
    matches.find((match) => match.id === matchId) ??
    matches.find((match) => ["scheduled", "locked", "draft"].includes(match.status)) ??
    matches[0];

  let players: BalancePlayer[] = [];

  if (selectedMatch) {
    const { data: attendanceRows } = await supabase
      .from("attendance")
      .select("player_id, status")
      .eq("team_id", team.id)
      .eq("match_id", selectedMatch.id)
      .in("status", [...attendanceStatuses]);

    const attendanceByPlayerId = new Map(
      (attendanceRows ?? []).map((attendance) => [attendance.player_id, attendance.status]),
    );
    const playerIds = [...attendanceByPlayerId.keys()];

    if (playerIds.length > 0) {
      const { data: playerRows } = await supabase
        .from("players")
        .select("id, display_name, shirt_number, position, level")
        .eq("team_id", team.id)
        .in("id", playerIds)
        .order("display_name", { ascending: true });

      players = (playerRows ?? []).map((player) => {
        const attendanceStatus = attendanceByPlayerId.get(player.id);
        const position = normalizePosition(player.position);

        return {
          id: player.id,
          name: player.display_name,
          shirtNumber: player.shirt_number ?? 0,
          level: Number(player.level),
          position,
          isGoalkeeper: attendanceStatus === "goalkeeper" || position === "GK",
          isLate: attendanceStatus === "late",
        };
      });
    }
  }

  return (
    <TeamBalancingModule
      teamSlug={teamSlug}
      matches={matches}
      selectedMatchId={selectedMatch?.id ?? null}
      players={players}
    />
  );
}
