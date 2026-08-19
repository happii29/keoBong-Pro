"use server";

import { revalidatePath } from "next/cache";

import type { Enums } from "@/services/supabase";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

const managerRoles = new Set(["owner", "manager", "captain"]);
const attendanceStatuses: Array<Enums<"attendance_status">> = [
  "going",
  "absent",
  "late",
  "goalkeeper",
  "pending",
];

export type AttendanceActionState = {
  error?: string;
  message?: string;
};

export async function updateAttendanceStatusAction(
  formData: FormData,
): Promise<AttendanceActionState> {
  const teamSlug = String(formData.get("teamSlug") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
  const status = String(formData.get("status") ?? "") as Enums<"attendance_status">;
  const { supabase, user } = await requireAuthenticatedUser(
    teamSlug ? `/teams/${teamSlug}/matches` : "/teams/new",
  );

  if (!teamSlug || !matchId || !playerId || !attendanceStatuses.includes(status)) {
    return { error: "Dá»¯ liá»‡u Ä‘iá»ƒm danh khÃ´ng há»£p lá»‡." };
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!team) {
    return { error: "KhÃ´ng tÃ¬m tháº¥y Ä‘á»™i bÃ³ng." };
  }

  const [{ data: membership }, { data: player }, { data: match }] =
    await Promise.all([
      supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("players")
        .select("id, team_id, user_id")
        .eq("id", playerId)
        .eq("team_id", team.id)
        .maybeSingle(),
      supabase
        .from("matches")
        .select("id, team_id")
        .eq("id", matchId)
        .eq("team_id", team.id)
        .maybeSingle(),
    ]);

  if (!membership || !player || !match) {
    return { error: "KhÃ´ng tÃ¬m tháº¥y tráº­n hoáº·c cáº§u thá»§." };
  }

  const canManageAll = managerRoles.has(membership.role);
  const canManageOwn = player.user_id === user.id;

  if (!canManageAll && !canManageOwn) {
    return { error: "Báº¡n khÃ´ng cÃ³ quyá»n cáº­p nháº­t Ä‘iá»ƒm danh nÃ y." };
  }

  const { error } = await supabase.from("attendance").upsert(
    {
      team_id: team.id,
      match_id: match.id,
      player_id: player.id,
      user_id: player.user_id,
      status,
      responded_at: status === "pending" ? null : new Date().toISOString(),
    },
    {
      onConflict: "match_id,player_id",
    },
  );

  if (error) {
    return { error: error.message || "KhÃ´ng thá»ƒ cáº­p nháº­t Ä‘iá»ƒm danh." };
  }

  revalidatePath(`/teams/${team.slug}/matches`);
  revalidatePath(`/teams/${team.slug}`);

  return { message: "ÄÃ£ cáº­p nháº­t Ä‘iá»ƒm danh." };
}
