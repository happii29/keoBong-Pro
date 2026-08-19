"use server";

import { revalidatePath } from "next/cache";

import type { Enums } from "@/services/supabase";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

import type { PlayerFormState } from "./player-management.types";

const managerRoles: Array<Enums<"team_role">> = ["owner", "manager", "captain"];
const playerPositions: Array<Enums<"player_position">> = [
  "GK",
  "CB",
  "LB",
  "RB",
  "DM",
  "CM",
  "AM",
  "LW",
  "RW",
  "ST",
];
const playerStatuses: Array<Enums<"player_status">> = [
  "active",
  "injured",
  "inactive",
];

export async function createPlayerAction(
  _previousState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const context = await getPlayerActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const parsed = parsePlayerForm(formData);

  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await context.supabase.from("players").insert({
    ...parsed.player,
    team_id: context.team.id,
    created_by: context.user.id,
  });

  if (error) {
    return mapPlayerMutationError(error.message, error.code);
  }

  revalidatePath(`/teams/${context.team.slug}/players`);

  return { message: "Đã thêm cầu thủ." };
}

export async function updatePlayerAction(
  _previousState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const context = await getPlayerActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const playerId = String(formData.get("playerId") ?? "");
  const parsed = parsePlayerForm(formData);

  if (!playerId) {
    return { error: "Thiếu mã cầu thủ." };
  }

  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await context.supabase
    .from("players")
    .update(parsed.player)
    .eq("id", playerId)
    .eq("team_id", context.team.id);

  if (error) {
    return mapPlayerMutationError(error.message, error.code);
  }

  revalidatePath(`/teams/${context.team.slug}/players`);

  return { message: "Đã cập nhật cầu thủ." };
}

export async function deletePlayerAction(formData: FormData): Promise<PlayerFormState> {
  const context = await getPlayerActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const playerId = String(formData.get("playerId") ?? "");

  if (!playerId) {
    return { error: "Thiáº¿u mÃ£ cáº§u thá»§." };
  }

  const { error } = await context.supabase
    .from("players")
    .delete()
    .eq("id", playerId)
    .eq("team_id", context.team.id);

  if (error) {
    return { error: error.message || "KhÃ´ng thá»ƒ xÃ³a cáº§u thá»§." };
  }

  revalidatePath(`/teams/${context.team.slug}/players`);

  return { message: "ÄÃ£ xÃ³a cáº§u thá»§." };
}

async function getPlayerActionContext(formData: FormData) {
  const teamSlug = String(formData.get("teamSlug") ?? "");
  const { supabase, user } = await requireAuthenticatedUser(
    teamSlug ? `/teams/${teamSlug}/players` : "/login",
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
    return { error: "Bạn không có quyền quản lý cầu thủ của đội này." };
  }

  return {
    supabase,
    team,
    user,
  };
}

function parsePlayerForm(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const shirtNumberValue = String(formData.get("shirtNumber") ?? "").trim();
  const positionValue = String(formData.get("position") ?? "");
  const levelValue = String(formData.get("level") ?? "5").trim();
  const phone = normalizeOptionalText(formData.get("phone"), 32);
  const zaloName = normalizeOptionalText(formData.get("zaloName"), 80);
  const status = String(formData.get("status") ?? "active") as Enums<"player_status">;

  if (displayName.length < 2 || displayName.length > 80) {
    return { error: "Tên cầu thủ cần từ 2 đến 80 ký tự." };
  }

  const shirtNumber = shirtNumberValue ? Number(shirtNumberValue) : null;

  if (
    shirtNumber !== null &&
    (!Number.isInteger(shirtNumber) || shirtNumber < 0 || shirtNumber > 999)
  ) {
    return { error: "Số áo cần là số nguyên từ 0 đến 999." };
  }

  const position = positionValue
    ? (positionValue as Enums<"player_position">)
    : null;

  if (position && !playerPositions.includes(position)) {
    return { error: "Vị trí cầu thủ không hợp lệ." };
  }

  const level = Number(levelValue);

  if (!Number.isFinite(level) || level < 1 || level > 10) {
    return { error: "Level cần nằm trong khoảng 1 đến 10." };
  }

  if (!playerStatuses.includes(status)) {
    return { error: "Trạng thái cầu thủ không hợp lệ." };
  }

  return {
    player: {
      display_name: displayName,
      shirt_number: shirtNumber,
      position,
      level,
      phone,
      zalo_name: zaloName,
      status,
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

function mapPlayerMutationError(message: string, code?: string) {
  if (code === "23505" || message.toLowerCase().includes("duplicate")) {
    return { error: "Số áo này đã được dùng trong đội." };
  }

  return { error: message || "Không thể lưu cầu thủ. Vui lòng thử lại." };
}
