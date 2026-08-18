"use server";

import { revalidatePath } from "next/cache";

import type { Enums } from "@/services/supabase";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

import type { RankingFormState } from "./ranking.types";

const managerRoles: Array<Enums<"team_role">> = ["owner", "manager", "captain"];

export async function updateMatchRankingStatsAction(
  _previousState: RankingFormState,
  formData: FormData,
): Promise<RankingFormState> {
  const context = await getRankingActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const matchId = String(formData.get("matchId") ?? "");
  const teamScore = Number(formData.get("teamScore") ?? "");
  const opponentScore = Number(formData.get("opponentScore") ?? "");
  const playerIds = formData.getAll("playerId").map((value) => String(value));

  if (!matchId) {
    return { error: "Thiếu trận đấu." };
  }

  if (
    !Number.isInteger(teamScore) ||
    !Number.isInteger(opponentScore) ||
    teamScore < 0 ||
    opponentScore < 0
  ) {
    return { error: "Tỷ số cần là số nguyên không âm." };
  }

  const { data: match } = await context.supabase
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .eq("team_id", context.team.id)
    .maybeSingle();

  if (!match) {
    return { error: "Không tìm thấy trận đấu." };
  }

  const rows = playerIds.map((playerId) => {
    const goals = parseStatNumber(formData.get(`goals:${playerId}`));
    const assists = parseStatNumber(formData.get(`assists:${playerId}`));
    const mvp = formData.get(`mvp:${playerId}`) === "on";

    return {
      team_id: context.team.id,
      match_id: matchId,
      player_id: playerId,
      goals,
      assists,
      mvp,
    };
  });

  if (rows.some((row) => row.goals < 0 || row.assists < 0)) {
    return { error: "Goals và assists không được âm." };
  }

  const { error: scoreError } = await context.supabase
    .from("matches")
    .update({
      team_score: teamScore,
      opponent_score: opponentScore,
      status: "completed",
    })
    .eq("id", matchId)
    .eq("team_id", context.team.id);

  if (scoreError) {
    return { error: scoreError.message || "Không thể lưu kết quả trận." };
  }

  if (rows.length > 0) {
    const { error: statsError } = await context.supabase
      .from("player_stats")
      .upsert(rows, { onConflict: "match_id,player_id" });

    if (statsError) {
      return { error: statsError.message || "Không thể lưu thống kê cầu thủ." };
    }
  }

  revalidatePath(`/teams/${context.team.slug}/ranking`);
  revalidatePath(`/teams/${context.team.slug}/matches`);
  revalidatePath(`/teams/${context.team.slug}`);

  return { message: "Đã cập nhật ranking sau trận." };
}

async function getRankingActionContext(formData: FormData) {
  const teamSlug = String(formData.get("teamSlug") ?? "");
  const { supabase, user } = await requireAuthenticatedUser(
    teamSlug ? `/teams/${teamSlug}/ranking` : "/login",
  );

  if (!teamSlug) {
    return { error: "Thiếu slug đội bóng." };
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!team) {
    return { error: "Không tìm thấy đội bóng." };
  }

  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !managerRoles.includes(membership.role)) {
    return { error: "Bạn không có quyền cập nhật ranking đội này." };
  }

  return {
    supabase,
    team,
  };
}

function parseStatNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}
