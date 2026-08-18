import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/guards";
import { PlayerManagementModule } from "@/modules/players/components/player-management-module";
import type { PlayerManagementRole } from "@/modules/players/player-management.types";

type PlayersPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function PlayersPage({ params }: PlayersPageProps) {
  const { teamSlug } = await params;
  const { supabase, user } = await requireAuthenticatedUser(
    `/teams/${teamSlug}/players`,
  );

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!team) {
    redirect("/teams/new");
  }

  const [{ data: membership }, { data: players }] = await Promise.all([
    supabase
      .from("team_members")
      .select("role")
      .eq("team_id", team.id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("players")
      .select("*")
      .eq("team_id", team.id)
      .order("status", { ascending: true })
      .order("shirt_number", { ascending: true, nullsFirst: false })
      .order("display_name", { ascending: true }),
  ]);

  if (!membership) {
    redirect("/teams/new");
  }

  return (
    <PlayerManagementModule
      teamSlug={team.slug}
      role={membership.role as PlayerManagementRole}
      players={players ?? []}
    />
  );
}
