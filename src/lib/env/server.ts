import "server-only";

import { publicEnv } from "@/lib/env/public";

export const serverEnv = {
  ...publicEnv,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? "",
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET ?? "",
} as const;
