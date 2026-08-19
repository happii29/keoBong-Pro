"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/services/supabase";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

import type { AuthFormState } from "./auth.types";
import {
  getPostAuthRedirectPath,
  getSafeRedirectPath,
  shouldUseRequestedPostAuthRedirect,
} from "./session";

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase chưa được cấu hình. Hãy điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestedRedirect = getSafeRedirectPath(formData.get("redirectTo"));

  if (!email || !password) {
    return { error: "Vui lòng nhập email và mật khẩu." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      error: error?.message ?? "Không thể đăng nhập. Vui lòng thử lại.",
    };
  }

  const redirectPath = await getPostAuthRedirectPath(
    supabase,
    data.user.id,
    requestedRedirect,
  );

  redirect(redirectPath);
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase chưa được cấu hình. Hãy điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestedRedirect = getSafeRedirectPath(formData.get("redirectTo"));

  if (!displayName || !email || !password) {
    return { error: "Vui lòng nhập tên, email và mật khẩu." };
  }

  if (password.length < 8) {
    return { error: "Mật khẩu cần có ít nhất 8 ký tự." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!data.session || !data.user) {
    return {
      message:
        "Tài khoản đã được tạo. Hãy kiểm tra email để xác nhận trước khi đăng nhập.",
    };
  }

  const redirectPath = await getPostAuthRedirectPath(
    supabase,
    data.user.id,
    requestedRedirect,
  );

  redirect(redirectPath);
}

export async function loginWithGoogleAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const requestedRedirect = getSafeRedirectPath(formData.get("redirectTo"));
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";
  const requestOrigin =
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ??
    headerStore.get("origin");
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
  const shouldIgnoreLocalConfiguredOrigin =
    Boolean(configuredOrigin?.includes("localhost")) &&
    Boolean(requestOrigin && !requestOrigin.includes("localhost"));
  const origin =
    (shouldIgnoreLocalConfiguredOrigin ? requestOrigin : configuredOrigin) ??
    requestOrigin ??
    "http://localhost:3000";
  const nextPath = shouldUseRequestedPostAuthRedirect(requestedRedirect)
    ? requestedRedirect
    : null;
  const cookieStore = await cookies();

  if (nextPath) {
    cookieStore.set("kb_auth_next", nextPath, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https://"),
      path: "/",
      maxAge: 60 * 10,
    });
  } else {
    cookieStore.delete("kb_auth_next");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Không thể đăng nhập Google.")}`);
  }

  redirect(data.url);
}
