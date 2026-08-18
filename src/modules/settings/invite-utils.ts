import { publicEnv } from "@/lib/env/public";

export function buildInviteUrl(token: string) {
  return `${publicEnv.appUrl.replace(/\/$/, "")}/invite/${token}`;
}
