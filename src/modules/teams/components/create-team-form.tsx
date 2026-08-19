"use client";

import { useActionState, useMemo, useState } from "react";
import { CalendarDays, MapPin, ShieldPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import { createTeamAction } from "../actions";
import { normalizeTeamSlug } from "../slug";
import type { CreateTeamFormState } from "../team-form.types";

const initialState: CreateTeamFormState = {};

const formatOptions = [
  { value: "5v5", label: "5v5" },
  { value: "7v7", label: "7v7" },
  { value: "9v9", label: "9v9" },
  { value: "11v11", label: "11v11" },
  { value: "other", label: "Khác" },
] as const;

const dayOptions = [
  { value: "", label: "Chưa cố định" },
  { value: "1", label: "Thứ 2" },
  { value: "2", label: "Thứ 3" },
  { value: "3", label: "Thứ 4" },
  { value: "4", label: "Thứ 5" },
  { value: "5", label: "Thứ 6" },
  { value: "6", label: "Thứ 7" },
  { value: "7", label: "Chủ nhật" },
] as const;

export function CreateTeamForm() {
  const [state, formAction, pending] = useActionState(
    createTeamAction,
    initialState,
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  useActionFeedback(state, pending, {
    successTitle: "Đã tạo đội bóng",
    errorTitle: "Không thể tạo đội",
  });

  const suggestedSlug = useMemo(() => normalizeTeamSlug(name), [name]);
  const displayedSlug = slugTouched ? slug : suggestedSlug;

  return (
    <Card className="w-full py-0">
      <CardHeader className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-gold/25 bg-gold/12 text-gold shadow-gold">
            <ShieldPlus className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Thông tin đội bóng</CardTitle>
            <CardDescription className="mt-2">
              Thiết lập hồ sơ đội để bắt đầu quản lý lịch đá, điểm danh và quỹ.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[1fr_0.85fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Tên đội</span>
              <Input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={80}
                required
                placeholder="FC Anh Em"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Slug URL</span>
              <Input
                name="slug"
                value={displayedSlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(normalizeTeamSlug(event.target.value));
                }}
                minLength={3}
                maxLength={48}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
                placeholder="fc-anh-em"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Khu vực</span>
              <Input
                name="area"
                maxLength={80}
                placeholder="Quận 10, TP.HCM"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Format mặc định</span>
              <select
                name="defaultFormat"
                defaultValue="7v7"
                className="h-11 w-full rounded-lg border border-white/12 bg-white/[0.055] px-3.5 py-2 text-sm text-foreground shadow-luxury outline-none backdrop-blur-xl transition-all duration-200 focus:border-emerald/45 focus:bg-white/[0.075] focus:ring-3 focus:ring-emerald/14"
              >
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Sân quen</span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="homeVenueName"
                maxLength={120}
                placeholder="Sân Phú Thọ - Sân 3"
                className="pl-10"
              />
            </div>
          </label>

          <div className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_180px]">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="size-4 text-gold" />
                Lịch đá cố định
              </span>
              <select
                name="scheduleDay"
                defaultValue=""
                className="h-11 w-full rounded-lg border border-white/12 bg-white/[0.055] px-3.5 py-2 text-sm text-foreground shadow-luxury outline-none backdrop-blur-xl transition-all duration-200 focus:border-emerald/45 focus:bg-white/[0.075] focus:ring-3 focus:ring-emerald/14"
              >
                {dayOptions.map((option) => (
                  <option key={option.value || "none"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Giờ đá</span>
              <Input name="scheduleTime" type="time" />
            </label>
          </div>

          {state.error ? (
            <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            loading={pending}
            loadingText="Đang tạo đội..."
          >
            <ShieldPlus className="size-4" />
            Tạo đội bóng
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
