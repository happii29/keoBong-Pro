import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/services/supabase/database.types";

export function getSafeRedirectPath(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return null;
  }

  if (value.startsWith("//") || value.includes("://")) {
    return null;
  }

  return value;
}

export function shouldUseRequestedPostAuthRedirect(
  value: string | null,
): value is string {
  return Boolean(
    value &&
      value !== "/login" &&
      value !== "/register" &&
      value !== "/teams/new",
  );
}

export async function getFirstTeamSlugForCurrentUser(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, joined_at")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return null;
  }

  const { data: team } = await supabase
    .from("teams")
    .select("slug")
    .eq("id", membership.team_id)
    .maybeSingle();

  return team?.slug ?? null;
}

export async function getPostAuthRedirectPath(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedRedirect: string | null,
) {
  if (shouldUseRequestedPostAuthRedirect(requestedRedirect)) {
    return requestedRedirect;
  }

  const firstTeamSlug = await getFirstTeamSlugForCurrentUser(supabase, userId);

  return firstTeamSlug ? `/teams/${firstTeamSlug}` : "/teams/new";
}
