import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/guards";
import { AutomationSettingsModule } from "@/modules/settings/components/automation-settings-module";
import { TeamInviteSettings } from "@/modules/settings/components/team-invite-settings";
import { buildInviteUrl } from "@/modules/settings/invite-utils";

type SettingsPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

const managerRoles = ["owner", "manager", "captain"];

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { teamSlug } = await params;
  const { supabase, user } = await requireAuthenticatedUser(
    `/teams/${teamSlug}/settings`,
  );

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!team) {
    redirect("/teams/new");
  }

  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/teams/new");
  }

  const canManageInvites = managerRoles.includes(membership.role);
  const { data: invites } = canManageInvites
    ? await supabase
        .from("team_invites")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <div className="space-y-6">
      <TeamInviteSettings
        teamSlug={team.slug}
        canManage={canManageInvites}
        invites={(invites ?? []).map((invite) => ({
          ...invite,
          inviteUrl: buildInviteUrl(invite.token),
        }))}
      />
      <AutomationSettingsModule teamSlug={team.slug} />
    </div>
  );
}
