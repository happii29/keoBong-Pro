"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appConfig } from "@/config/app";

import { acceptInviteAction } from "../actions";
import type { AcceptInviteFormState } from "../invite.types";

const initialState: AcceptInviteFormState = {};

export function AcceptInviteCard({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    acceptInviteAction,
    initialState,
  );
  const shortToken = token.length > 12 ? `${token.slice(0, 8)}...` : token;

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
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Tham gia đội bóng</CardTitle>
              <CardDescription className="mt-2">
                Invite #{shortToken}. Đăng nhập đúng tài khoản bạn muốn dùng
                trong đội trước khi xác nhận.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            {state.error ? (
              <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            ) : null}

            <Button type="submit" variant="gold" size="lg" className="w-full">
              <LogIn className="size-4" />
              {pending ? "Đang tham gia..." : "Tham gia đội"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
