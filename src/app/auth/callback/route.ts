import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  getFirstTeamSlugForCurrentUser,
  getSafeRedirectPath,
  shouldUseRequestedPostAuthRedirect,
} from "@/modules/auth/session";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieStore = await cookies();
  const nextPath =
    getSafeRedirectPath(cookieStore.get("kb_auth_next")?.value ?? null) ??
    getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const response = NextResponse.redirect(new URL("/login", requestUrl.origin));
    response.cookies.delete("kb_auth_next");
    return response;
  }

  if (shouldUseRequestedPostAuthRedirect(nextPath)) {
    const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    response.cookies.delete("kb_auth_next");
    return response;
  }

  const firstTeamSlug = await getFirstTeamSlugForCurrentUser(supabase, user.id);

  const response = NextResponse.redirect(
    new URL(firstTeamSlug ? `/teams/${firstTeamSlug}` : "/teams/new", requestUrl.origin),
  );
  response.cookies.delete("kb_auth_next");

  return response;
}
