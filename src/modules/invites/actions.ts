"use server";

import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

import type { AcceptInviteFormState } from "./invite.types";

export async function acceptInviteAction(
  _previousState: AcceptInviteFormState,
  formData: FormData,
): Promise<AcceptInviteFormState> {
  const token = String(formData.get("token") ?? "");
  const { supabase } = await requireAuthenticatedUser(`/invite/${token}`);

  if (!token) {
    return { error: "Invite link không hợp lệ." };
  }

  const { data, error } = await supabase.rpc("accept_team_invite", {
    invite_token: token,
  });

  if (error) {
    if (error.code === "P0002") {
      return { error: "Invite link không tồn tại." };
    }

    if (error.code === "22023") {
      return { error: "Invite link đã hết hạn hoặc hết lượt sử dụng." };
    }

    if (error.code === "P0001") {
      return { error: "Invite link đã bị thu hồi." };
    }

    if (error.code === "PGRST202") {
      return {
        error:
          "Database chưa có function accept_team_invite. Hãy chạy migration 202608180005_team_invites.sql.",
      };
    }

    return {
      error: error.message || "Không thể tham gia đội bằng invite này.",
    };
  }

  const joinedSlug = data?.[0]?.joined_team_slug;

  if (!joinedSlug) {
    return { error: "Invite hợp lệ nhưng không tìm thấy slug đội." };
  }

  redirect(`/teams/${joinedSlug}`);
}
