import { NextResponse } from "next/server";

import {
  getFirstTeamSlugForCurrentUser,
  getSafeRedirectPath,
} from "@/modules/auth/session";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  if (nextPath && nextPath !== "/login" && nextPath !== "/register") {
    return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
  }

  const firstTeamSlug = await getFirstTeamSlugForCurrentUser(supabase, user.id);

  return NextResponse.redirect(
    new URL(firstTeamSlug ? `/teams/${firstTeamSlug}` : "/teams/new", requestUrl.origin),
  );
}
