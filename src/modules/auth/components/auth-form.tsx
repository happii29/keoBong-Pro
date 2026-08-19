"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Globe2, LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { appConfig } from "@/config/app";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import type { AuthFormState } from "../auth.types";
import { loginAction, loginWithGoogleAction, registerAction } from "../actions";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  redirectTo?: string;
};

const initialState: AuthFormState = {};

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const isLogin = mode === "login";
  const [state, formAction, pending] = useActionState(
    isLogin ? loginAction : registerAction,
    initialState,
  );
  useActionFeedback(state, pending, {
    successTitle: isLogin ? "Đăng nhập thành công" : "Đăng ký thành công",
    errorTitle: isLogin ? "Không thể đăng nhập" : "Không thể đăng ký",
  });
  const Icon = isLogin ? LogIn : UserPlus;

  return (
    <main className="luxury-shell-bg grid min-h-svh place-items-center px-4 py-8">
      <Card className="w-full max-w-md py-0">
        <CardHeader className="border-b border-white/10 px-5 py-5">
          <Link href="/" className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg border border-gold/25 bg-gold/12 font-display text-sm font-bold text-gold shadow-gold">
              KB
            </div>
            <span className="font-display text-base font-semibold">
              {appConfig.name}
            </span>
          </Link>
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-emerald/25 bg-emerald/12 text-emerald">
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
              </CardTitle>
              <CardDescription className="mt-2">
                {isLogin
                  ? "Vào workspace đội bóng của bạn."
                  : "Tạo tài khoản captain hoặc thành viên đội bóng."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form action={loginWithGoogleAction}>
            <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
            <PendingSubmitButton
              variant="luxury"
              size="lg"
              className="w-full"
              pendingText="Đang mở Google..."
            >
              <Globe2 className="size-4" />
              Tiếp tục với Google
            </PendingSubmitButton>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px flex-1 bg-white/10" />
            hoặc
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

            {isLogin ? null : (
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Tên hiển thị</span>
                <Input
                  name="displayName"
                  autoComplete="name"
                  required
                  placeholder="Nguyễn Minh"
                />
              </label>
            )}

            <label className="block space-y-2">
              <span className="text-sm font-semibold">Email</span>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="captain@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">Mật khẩu</span>
              <Input
                type="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 8}
                required
                placeholder={isLogin ? "Nhập mật khẩu" : "Tối thiểu 8 ký tự"}
              />
            </label>

            {state.error ? (
              <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            ) : null}

            {state.message ? (
              <div className="rounded-md border border-emerald/25 bg-emerald/10 px-3 py-2 text-sm text-emerald">
                {state.message}
              </div>
            ) : null}

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              loading={pending}
              loadingText={isLogin ? "Đang đăng nhập..." : "Đang đăng ký..."}
            >
              <Icon className="size-4" />
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
            <Link
              href={{
                pathname: isLogin ? "/register" : "/login",
                query: redirectTo ? { redirectTo } : undefined,
              }}
              className="font-semibold text-gold hover:underline"
            >
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
