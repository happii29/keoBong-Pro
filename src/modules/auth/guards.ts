import "server-only";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/services/supabase";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

import { getFirstTeamSlugForCurrentUser } from "./session";

export async function requireAuthenticatedUser(redirectTo: string) {
  if (!isSupabaseConfigured()) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return {
    supabase,
    user,
  };
}

export async function requireTeamWorkspaceAccess(teamSlug: string) {
  const requestedPath = `/teams/${teamSlug}`;
  const { supabase, user } = await requireAuthenticatedUser(requestedPath);

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug")
    .eq("slug", teamSlug)
    .maybeSingle();

  if (team) {
    return {
      supabase,
      team,
      user,
    };
  }

  const firstTeamSlug = await getFirstTeamSlugForCurrentUser(supabase, user.id);

  redirect(firstTeamSlug ? `/teams/${firstTeamSlug}` : "/teams/new");
}
