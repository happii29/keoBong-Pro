import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/guards";
import { MatchManagementModule } from "@/modules/matches/components/match-management-module";
import type { MatchManagementRole } from "@/modules/matches/match-management.types";

type MatchesPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function MatchesPage({ params }: MatchesPageProps) {
  const { teamSlug } = await params;
  const { supabase, user } = await requireAuthenticatedUser(
    `/teams/${teamSlug}/matches`,
  );

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!team) {
    redirect("/teams/new");
  }

  const [{ data: membership }, { data: matches }, { data: players }] = await Promise.all([
    supabase
      .from("team_members")
      .select("role")
      .eq("team_id", team.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("matches")
      .select("*")
      .eq("team_id", team.id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("players")
      .select("id, display_name, shirt_number, position, status, user_id")
      .eq("team_id", team.id)
      .neq("status", "left")
      .order("shirt_number", { ascending: true, nullsFirst: false })
      .order("display_name", { ascending: true }),
  ]);

  if (!membership) {
    redirect("/teams/new");
  }

  const matchIds = (matches ?? []).map((match) => match.id);
  const { data: attendance } = matchIds.length
    ? await supabase
        .from("attendance")
        .select("*")
        .eq("team_id", team.id)
        .in("match_id", matchIds)
    : { data: [] };

  return (
    <MatchManagementModule
      teamSlug={team.slug}
      role={membership.role as MatchManagementRole}
      matches={matches ?? []}
      players={players ?? []}
      attendance={attendance ?? []}
      currentUserId={user.id}
      currentTime={new Date().toISOString()}
    />
  );
}
