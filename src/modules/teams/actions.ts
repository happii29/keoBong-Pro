"use server";

import { redirect } from "next/navigation";

import type { Enums, Json } from "@/services/supabase";

import { requireAuthenticatedUser } from "@/modules/auth/guards";

import type { CreateTeamFormState, JoinTeamFormState } from "./team-form.types";
import { isValidTeamSlug, normalizeTeamSlug } from "./slug";

const matchFormats: Array<Enums<"match_format">> = [
  "5v5",
  "7v7",
  "9v9",
  "11v11",
  "other",
];

export async function createTeamAction(
  _previousState: CreateTeamFormState,
  formData: FormData,
): Promise<CreateTeamFormState> {
  const { supabase } = await requireAuthenticatedUser("/teams/new");

  const name = String(formData.get("name") ?? "").trim();
  const slug = normalizeTeamSlug(String(formData.get("slug") ?? ""));
  const area = normalizeOptionalText(formData.get("area"), 80);
  const homeVenueName = normalizeOptionalText(formData.get("homeVenueName"), 120);
  const defaultFormat = String(formData.get("defaultFormat") ?? "7v7") as Enums<"match_format">;
  const scheduleDay = String(formData.get("scheduleDay") ?? "");
  const scheduleTime = String(formData.get("scheduleTime") ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return { error: "Tên đội cần từ 2 đến 80 ký tự." };
  }

  if (slug.length < 3 || slug.length > 48 || !isValidTeamSlug(slug)) {
    return {
      error:
        "Slug cần từ 3 đến 48 ký tự, chỉ gồm chữ thường, số và dấu gạch ngang.",
    };
  }

  if (!matchFormats.includes(defaultFormat)) {
    return { error: "Format đá không hợp lệ." };
  }

  if (!isValidScheduleDay(scheduleDay)) {
    return { error: "Ngày đá cố định không hợp lệ." };
  }

  if (scheduleTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduleTime)) {
    return { error: "Giờ đá cố định không hợp lệ." };
  }

  const { data: existingTeam } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingTeam) {
    return { error: "Slug này đã được dùng. Hãy chọn slug khác." };
  }

  const fixedSchedule = buildFixedSchedule(scheduleDay, scheduleTime);
  const { data, error } = await supabase.rpc("create_team_with_owner", {
    team_name: name,
    team_slug: slug,
    team_area: area,
    team_default_format: defaultFormat,
    team_home_venue_name: homeVenueName,
    team_fixed_schedule: fixedSchedule,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Slug này đã được dùng. Hãy chọn slug khác." };
    }

    return {
      error: error.message || "Không thể tạo đội. Vui lòng thử lại.",
    };
  }

  const createdSlug = data?.[0]?.created_team_slug ?? slug;

  redirect(`/teams/${createdSlug}`);
}

export async function joinTeamBySlugAction(
  _previousState: JoinTeamFormState,
  formData: FormData,
): Promise<JoinTeamFormState> {
  const { supabase } = await requireAuthenticatedUser("/teams/new");
  const slug = normalizeTeamSlug(String(formData.get("teamSlug") ?? ""));

  if (slug.length < 3 || slug.length > 48 || !isValidTeamSlug(slug)) {
    return {
      error:
        "Slug đội không hợp lệ. Hãy nhập slug như fc-anh-em.",
    };
  }

  const { data, error } = await supabase.rpc("join_team_by_slug", {
    team_slug: slug,
  });

  if (error) {
    if (error.code === "P0002") {
      return { error: "Không tìm thấy đội với slug này." };
    }

    if (error.code === "PGRST202") {
      return {
        error:
          "Database chưa có function join_team_by_slug. Hãy chạy migration 202608180004_fix_team_bootstrap_and_join.sql.",
      };
    }

    return {
      error: error.message || "Không thể tham gia đội. Vui lòng thử lại.",
    };
  }

  const joinedSlug = data?.[0]?.joined_team_slug ?? slug;

  redirect(`/teams/${joinedSlug}`);
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

function isValidScheduleDay(value: string) {
  if (!value) {
    return true;
  }

  const day = Number(value);

  return Number.isInteger(day) && day >= 1 && day <= 7;
}

function buildFixedSchedule(day: string, time: string): Json {
  if (!day && !time) {
    return {
      enabled: false,
    };
  }

  return {
    enabled: Boolean(day || time),
    dayOfWeek: day ? Number(day) : null,
    time: time || null,
  };
}
