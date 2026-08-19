import { redirect } from "next/navigation";

import { AuthForm } from "@/modules/auth/components/auth-form";
import {
  getPostAuthRedirectPath,
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
      const redirectPath = await getPostAuthRedirectPath(
        supabase,
        user.id,
        safeRedirectTo,
      );

      redirect(redirectPath);
    }
  }

  return <AuthForm mode="login" redirectTo={safeRedirectTo ?? undefined} />;
}
