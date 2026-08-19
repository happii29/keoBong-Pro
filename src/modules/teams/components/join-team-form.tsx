"use client";

import { useActionState, useState } from "react";
import { LogIn, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SoccerLoader } from "@/components/ui/soccer-loader";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import { joinTeamBySlugAction } from "../actions";
import { normalizeTeamSlug } from "../slug";
import type { JoinTeamFormState } from "../team-form.types";

const initialState: JoinTeamFormState = {};

export function JoinTeamForm() {
  const [state, formAction, pending] = useActionState(
    joinTeamBySlugAction,
    initialState,
  );
  const [teamSlug, setTeamSlug] = useState("");
  useActionFeedback(state, pending, {
    successTitle: "Đã tham gia đội",
    errorTitle: "Không thể tham gia đội",
  });

  return (
    <Card className="w-full py-0">
      <CardHeader className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-emerald/25 bg-emerald/12 text-emerald shadow-emerald">
            <Search className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Tham gia đội có sẵn</CardTitle>
            <CardDescription className="mt-2">
              Nhập slug đội do captain gửi để vào workspace đội bóng.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <form action={formAction} className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold">Slug đội</span>
            <Input
              name="teamSlug"
              value={teamSlug}
              onChange={(event) => setTeamSlug(normalizeTeamSlug(event.target.value))}
              minLength={3}
              maxLength={48}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              placeholder="fc-anh-em"
            />
          </label>

          {state.error ? (
            <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          ) : null}

          <Button type="submit" variant="emerald" size="lg" className="w-full">
            {pending ? <SoccerLoader /> : <LogIn className="size-4" />}
            {pending ? "Đang tham gia..." : "Tham gia đội"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
