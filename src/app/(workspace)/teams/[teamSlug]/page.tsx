import { redirect } from "next/navigation";

import {
  DashboardOverview,
  type DashboardMatch,
} from "@/modules/dashboard/components/dashboard-overview";
import { requireAuthenticatedUser } from "@/modules/auth/guards";

type TeamDashboardPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function TeamDashboardPage({
  params,
}: TeamDashboardPageProps) {
  const { teamSlug } = await params;
  const { supabase } = await requireAuthenticatedUser(`/teams/${teamSlug}`);

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!team) {
    redirect("/teams/new");
  }

  const now = new Date().toISOString();
  const [{ data: players }, { data: nextMatch }] = await Promise.all([
    supabase
      .from("players")
      .select("id, status")
      .eq("team_id", team.id)
      .neq("status", "left"),
    supabase
      .from("matches")
      .select("*")
      .eq("team_id", team.id)
      .gte("starts_at", now)
      .not("status", "in", "(completed,cancelled)")
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const activePlayers = (players ?? []).filter(
    (player) => player.status === "active",
  ).length;
  const injuredPlayers = (players ?? []).filter(
    (player) => player.status === "injured" || player.status === "inactive",
  ).length;

  let upcomingMatch: DashboardMatch | undefined;

  if (nextMatch) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("player_id, status")
      .eq("team_id", team.id)
      .eq("match_id", nextMatch.id);

    const attendanceByPlayer = new Map(
      (attendance ?? []).map((item) => [item.player_id, item.status]),
    );
    const totalPlayers = players?.length ?? 0;
    const confirmed = (players ?? []).filter((player) => {
      const status = attendanceByPlayer.get(player.id) ?? "pending";

      return status === "going" || status === "late" || status === "goalkeeper";
    }).length;
    const declined = (players ?? []).filter(
      (player) => (attendanceByPlayer.get(player.id) ?? "pending") === "absent",
    ).length;

    upcomingMatch = {
      opponent: nextMatch.opponent_name ?? "Tran noi bo",
      dateLabel: formatDashboardDate(nextMatch.starts_at),
      venue: nextMatch.venue_name ?? "Chua chon san",
      format: nextMatch.format,
      status: nextMatch.status,
      confirmed,
      declined,
      pending: Math.max(totalPlayers - confirmed - declined, 0),
      totalPlayers,
    };
  }

  return (
    <DashboardOverview
      teamSlug={team.slug}
      upcomingMatch={upcomingMatch}
      activePlayers={activePlayers}
      injuredPlayers={injuredPlayers}
    />
  );
}

function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
