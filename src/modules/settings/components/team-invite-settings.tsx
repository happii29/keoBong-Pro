"use client";

import { useActionState } from "react";
import type * as React from "react";
import { Clipboard, Link2, Plus, RotateCcw, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import { cn } from "@/lib/utils";

import {
  createTeamInviteAction,
  revokeTeamInviteAction,
} from "../invite-actions";
import type { CreateInviteFormState, TeamInvite } from "../invite.types";

type TeamInviteSettingsProps = {
  teamSlug: string;
  canManage: boolean;
  invites: Array<TeamInvite & { inviteUrl: string }>;
};

const initialState: CreateInviteFormState = {};

export function TeamInviteSettings({
  teamSlug,
  canManage,
  invites,
}: TeamInviteSettingsProps) {
  const [state, formAction, pending] = useActionState(
    createTeamInviteAction,
    initialState,
  );
  const { copied, copying, copy } = useCopyToClipboard(1600);

  useActionFeedback(state, pending, {
    successTitle: "Đã tạo invite link",
    errorTitle: "Không thể tạo invite link",
  });

  if (!canManage) {
    return null;
  }

  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="size-5 text-emerald" />
          Mời thành viên
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <form
          action={formAction}
          className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <input type="hidden" name="teamSlug" value={teamSlug} />

          <label className="space-y-2">
            <span className="text-sm font-semibold">Hết hạn sau</span>
            <Select name="expiresInDays" defaultValue="7">
              <option value="1">1 ngày</option>
              <option value="3">3 ngày</option>
              <option value="7">7 ngày</option>
              <option value="14">14 ngày</option>
              <option value="30">30 ngày</option>
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Số lượt dùng</span>
            <Select name="maxUses" defaultValue="1">
              <option value="1">1 người</option>
              <option value="5">5 người</option>
              <option value="10">10 người</option>
              <option value="25">25 người</option>
            </Select>
          </label>

          <Button
            type="submit"
            variant="gold"
            className="self-end"
            loading={pending}
            loadingText="Đang tạo..."
          >
            <Plus className="size-4" />
            {pending ? "Đang tạo..." : "Tạo link"}
          </Button>
        </form>

        {state.error ? (
          <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}

        {state.inviteUrl ? (
          <div className="rounded-lg border border-emerald/25 bg-emerald/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald">Invite mới</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {state.inviteUrl}
                </p>
              </div>
              <Button
                type="button"
                variant="emerald"
                size="sm"
                loading={copying}
                loadingText="Đang copy..."
                onClick={() => void copy(state.inviteUrl ?? "")}
              >
                <Clipboard className="size-4" />
                {copied ? "Đã copy" : "Copy"}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {invites.length ? (
            invites.map((invite) => (
              <InviteRow key={invite.id} invite={invite} teamSlug={teamSlug} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.035] p-5 text-center text-sm text-muted-foreground">
              Chưa có invite link nào.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InviteRow({
  invite,
  teamSlug,
}: {
  invite: TeamInvite & { inviteUrl: string };
  teamSlug: string;
}) {
  const { copied, copying, copy } = useCopyToClipboard(1600);
  const [state, formAction, pending] = useActionState(
    (_previousState: CreateInviteFormState, formData: FormData) =>
      revokeTeamInviteAction(formData),
    initialState,
  );
  useActionFeedback(state, pending, {
    successTitle: "Đã thu hồi invite",
    errorTitle: "Không thể thu hồi invite",
  });
  const status = getInviteStatus(invite);
  const expiresAt = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(invite.expires_at));

  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link2 className="size-4 text-gold" />
          <p className="truncate text-sm font-semibold">{invite.inviteUrl}</p>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Role member · Đã dùng {invite.used_count}/{invite.max_uses} · Hết hạn {expiresAt}
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="luxury"
          size="sm"
          loading={copying}
          loadingText="Đang copy..."
          onClick={() => void copy(invite.inviteUrl)}
        >
          <Clipboard className="size-4" />
          {copied ? "Đã copy" : "Copy"}
        </Button>

        {!invite.revoked_at ? (
          <form action={formAction}>
            <input type="hidden" name="teamSlug" value={teamSlug} />
            <input type="hidden" name="inviteId" value={invite.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              loading={pending}
              loadingText="Đang thu hồi..."
            >
              <RotateCcw className="size-4" />
              Thu hồi
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function getInviteStatus(invite: TeamInvite) {
  if (invite.revoked_at) {
    return { label: "Revoked", variant: "glass" as const };
  }

  if (new Date(invite.expires_at).getTime() <= Date.now()) {
    return { label: "Expired", variant: "gold" as const };
  }

  if (invite.used_count >= invite.max_uses) {
    return { label: "Used", variant: "glass" as const };
  }

  return { label: "Active", variant: "emerald" as const };
}

function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-white/12 bg-white/[0.055] px-3.5 py-2 text-sm text-foreground shadow-luxury outline-none backdrop-blur-xl transition-all duration-200 focus:border-emerald/45 focus:bg-white/[0.075] focus:ring-3 focus:ring-emerald/14",
        className,
      )}
      {...props}
    />
  );
}
