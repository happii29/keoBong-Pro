import { redirect } from "next/navigation";

import { AuthForm } from "@/modules/auth/components/auth-form";
import {
  getFirstTeamSlugForCurrentUser,
  getSafeRedirectPath,
} from "@/modules/auth/session";
import { isSupabaseConfigured } from "@/services/supabase";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;
  const safeRedirectTo = getSafeRedirectPath(redirectTo ?? null);

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const firstTeamSlug = await getFirstTeamSlugForCurrentUser(
        supabase,
        user.id,
      );
      const fallbackPath = firstTeamSlug ? `/teams/${firstTeamSlug}` : "/teams/new";

      redirect(safeRedirectTo ?? fallbackPath);
    }
  }

  return <AuthForm mode="login" redirectTo={safeRedirectTo ?? undefined} />;
}
