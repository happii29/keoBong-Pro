"use server";

import { revalidatePath } from "next/cache";

import type { Enums } from "@/services/supabase";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

import type { FundFormState } from "./finance.types";

const managerRoles: Array<Enums<"team_role">> = ["owner", "manager", "captain"];
const transactionTypes: Array<Enums<"fund_transaction_type">> = ["income", "expense"];

export async function createFundTransactionAction(
  _previousState: FundFormState,
  formData: FormData,
): Promise<FundFormState> {
  const context = await getFundActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const parsed = parseFundTransactionForm(formData);

  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await context.supabase.from("fund_transactions").insert({
    ...parsed.transaction,
    team_id: context.team.id,
    created_by: context.user.id,
  });

  if (error) {
    return { error: error.message || "Không thể thêm giao dịch." };
  }

  revalidatePath(`/teams/${context.team.slug}/finance`);
  revalidatePath(`/teams/${context.team.slug}`);

  return { message: "Đã thêm giao dịch quỹ." };
}

export async function updateFundTransactionAction(
  _previousState: FundFormState,
  formData: FormData,
): Promise<FundFormState> {
  const context = await getFundActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const transactionId = String(formData.get("transactionId") ?? "");
  const parsed = parseFundTransactionForm(formData);

  if (!transactionId) {
    return { error: "Thiếu mã giao dịch." };
  }

  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await context.supabase
    .from("fund_transactions")
    .update(parsed.transaction)
    .eq("id", transactionId)
    .eq("team_id", context.team.id);

  if (error) {
    return { error: error.message || "Không thể cập nhật giao dịch." };
  }

  revalidatePath(`/teams/${context.team.slug}/finance`);
  revalidatePath(`/teams/${context.team.slug}`);

  return { message: "Đã cập nhật giao dịch quỹ." };
}

export async function deleteFundTransactionAction(formData: FormData): Promise<FundFormState> {
  const context = await getFundActionContext(formData);

  if ("error" in context) {
    return context;
  }

  const transactionId = String(formData.get("transactionId") ?? "");

  if (!transactionId) {
    return { error: "Thiáº¿u mÃ£ giao dá»‹ch." };
  }

  const { error } = await context.supabase
    .from("fund_transactions")
    .delete()
    .eq("id", transactionId)
    .eq("team_id", context.team.id);

  if (error) {
    return { error: error.message || "KhÃ´ng thá»ƒ xÃ³a giao dá»‹ch." };
  }

  revalidatePath(`/teams/${context.team.slug}/finance`);
  revalidatePath(`/teams/${context.team.slug}`);

  return { message: "ÄÃ£ xÃ³a giao dá»‹ch quá»¹." };
}

async function getFundActionContext(formData: FormData) {
  const teamSlug = String(formData.get("teamSlug") ?? "");
  const { supabase, user } = await requireAuthenticatedUser(
    teamSlug ? `/teams/${teamSlug}/finance` : "/login",
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
    return { error: "Bạn không có quyền quản lý quỹ đội này." };
  }

  return {
    supabase,
    team,
    user,
  };
}

function parseFundTransactionForm(formData: FormData) {
  const type = String(formData.get("type") ?? "income") as Enums<"fund_transaction_type">;
  const category = String(formData.get("category") ?? "").trim().slice(0, 80);
  const title = String(formData.get("title") ?? "").trim().slice(0, 140);
  const amount = Number(formData.get("amountVnd") ?? 0);
  const transactionDate = String(formData.get("transactionDate") ?? "").trim();
  const matchId = normalizeOptionalUuid(formData.get("matchId"));
  const playerId = normalizeOptionalUuid(formData.get("playerId"));
  const note = normalizeOptionalText(formData.get("note"), 500);

  if (!transactionTypes.includes(type)) {
    return { error: "Loại giao dịch không hợp lệ." };
  }

  if (title.length < 2) {
    return { error: "Nội dung giao dịch cần ít nhất 2 ký tự." };
  }

  if (!category) {
    return { error: "Vui lòng nhập danh mục giao dịch." };
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999) {
    return { error: "Số tiền cần lớn hơn 0." };
  }

  if (transactionDate && Number.isNaN(new Date(`${transactionDate}T00:00:00`).getTime())) {
    return { error: "Ngày giao dịch không hợp lệ." };
  }

  return {
    transaction: {
      type,
      category,
      title,
      amount_vnd: Math.round(amount),
      transaction_date: transactionDate || new Date().toISOString().slice(0, 10),
      match_id: matchId,
      player_id: playerId,
      note,
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

function normalizeOptionalUuid(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}
