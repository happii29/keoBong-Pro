"use server";

import { randomBytes } from "crypto";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

import type { CreateInviteFormState } from "./invite.types";
import { buildInviteUrl } from "./invite-utils";

const managerRoles = new Set(["owner", "manager", "captain"]);
const expiryOptions = new Set([1, 3, 7, 14, 30]);
const maxUseOptions = new Set([1, 5, 10, 25]);

export async function createTeamInviteAction(
  _previousState: CreateInviteFormState,
  formData: FormData,
): Promise<CreateInviteFormState> {
  const context = await getInviteAdminContext(formData);

  if ("error" in context) {
    return context;
  }

  const expiresInDays = Number(formData.get("expiresInDays") ?? 7);
  const maxUses = Number(formData.get("maxUses") ?? 1);

  if (!expiryOptions.has(expiresInDays)) {
    return { error: "Thời hạn invite không hợp lệ." };
  }

  if (!maxUseOptions.has(maxUses)) {
    return { error: "Số lượt dùng invite không hợp lệ." };
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await context.supabase.from("team_invites").insert({
    team_id: context.team.id,
    token,
    role: "member",
    expires_at: expiresAt,
    max_uses: maxUses,
    created_by: context.user.id,
  });

  if (error) {
    return {
      error: error.message || "Không thể tạo invite link.",
    };
  }

  revalidatePath(`/teams/${context.team.slug}/settings`);

  return {
    inviteUrl: buildInviteUrl(token),
    message: "ÄÃ£ táº¡o invite link.",
  };
}

export async function revokeTeamInviteAction(formData: FormData): Promise<CreateInviteFormState> {
  const context = await getInviteAdminContext(formData);

  if ("error" in context) {
    return context;
  }

  const inviteId = String(formData.get("inviteId") ?? "");

  if (!inviteId) {
    return { error: "Thiáº¿u mÃ£ invite." };
  }

  const { error } = await context.supabase
    .from("team_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("team_id", context.team.id);

  if (error) {
    return { error: error.message || "KhÃ´ng thá»ƒ thu há»“i invite." };
  }

  revalidatePath(`/teams/${context.team.slug}/settings`);

  return { message: "ÄÃ£ thu há»“i invite link." };
}

async function getInviteAdminContext(formData: FormData) {
  const teamSlug = String(formData.get("teamSlug") ?? "");
  const { supabase, user } = await requireAuthenticatedUser(
    teamSlug ? `/teams/${teamSlug}/settings` : "/teams/new",
  );

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
    return { error: "Bạn không có quyền tạo invite cho đội này." };
  }

  return {
    supabase,
    team,
    user,
  };
}
