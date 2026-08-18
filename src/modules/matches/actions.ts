"use server";

import { revalidatePath } from "next/cache";

import type { Enums } from "@/services/supabase";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

import type { MatchFormState } from "./match-management.types";

const managerRoles = new Set(["owner", "manager", "captain"]);
const matchFormats: Array<Enums<"match_format">> = [
  "5v5",
  "7v7",
  "9v9",
  "11v11",
  "other",
];
const statusTransitions: Array<Enums<"match_status">> = [
  "draft",
  "scheduled",
  "locked",
  "completed",
  "cancelled",
];

export async function createMatchAction(
  _previousState: MatchFormState,
  formData: FormData,
): Promise<MatchFormState> {
  const context = await getMatchActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const parsed = parseMatchForm(formData);

  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await context.supabase.from("matches").insert({
    ...parsed.match,
    team_id: context.team.id,
    created_by: context.user.id,
  });

  if (error) {
    return {
      error: error.message || "Không thể tạo trận đấu. Vui lòng thử lại.",
    };
  }

  revalidatePath(`/teams/${context.team.slug}/matches`);

  return { message: "Đã tạo trận đấu." };
}

export async function updateMatchStatusAction(formData: FormData) {
  const context = await getMatchActionContext(formData);

  if ("error" in context) {
    return;
  }

  const matchId = String(formData.get("matchId") ?? "");
  const status = String(formData.get("status") ?? "") as Enums<"match_status">;

  if (!matchId || !statusTransitions.includes(status)) {
    return;
  }

  await context.supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId)
    .eq("team_id", context.team.id);

  revalidatePath(`/teams/${context.team.slug}/matches`);
}

async function getMatchActionContext(formData: FormData) {
  const teamSlug = String(formData.get("teamSlug") ?? "");
  const { supabase, user } = await requireAuthenticatedUser(
    teamSlug ? `/teams/${teamSlug}/matches` : "/teams/new",
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

  if (!membership || !managerRoles.has(membership.role)) {
    return { error: "Bạn không có quyền quản lý trận đấu của đội này." };
  }

  return {
    supabase,
    team,
    user,
  };
}

function parseMatchForm(formData: FormData) {
  const opponentName = normalizeOptionalText(formData.get("opponentName"), 100);
  const venueName = normalizeOptionalText(formData.get("venueName"), 120);
  const startsAtInput = String(formData.get("startsAt") ?? "").trim();
  const format = String(formData.get("format") ?? "7v7") as Enums<"match_format">;
  const minPlayers = Number(formData.get("minPlayers") ?? 10);
  const notes = normalizeOptionalText(formData.get("notes"), 500);

  if (!startsAtInput) {
    return { error: "Vui lòng chọn ngày giờ đá." };
  }

  const startsAt = new Date(startsAtInput);

  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Ngày giờ đá không hợp lệ." };
  }

  if (!matchFormats.includes(format)) {
    return { error: "Format đá không hợp lệ." };
  }

  if (!Number.isInteger(minPlayers) || minPlayers < 1 || minPlayers > 99) {
    return { error: "Số người tối thiểu cần từ 1 đến 99." };
  }

  return {
    match: {
      opponent_name: opponentName,
      venue_name: venueName,
      starts_at: startsAt.toISOString(),
      format,
      min_players: minPlayers,
      status: "scheduled" as const,
      notes,
    },
  };
}

function normalizeOptionalText(
  value: FormDataEntryValue | null,
  maxLength: number,
) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
}
