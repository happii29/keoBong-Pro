import "server-only";

import { serverEnv } from "@/lib/env/server";
import { createHttpClient } from "@/services/api/http-client";
import type { ApiResult } from "@/types/api";

import type { N8nWorkflowEvent, N8nWorkflowResponse } from "./n8n.types";

export async function dispatchN8nWorkflow<TPayload>(
  event: N8nWorkflowEvent<TPayload>,
): Promise<ApiResult<N8nWorkflowResponse>> {
  if (!serverEnv.n8nWebhookUrl) {
    return {
      ok: false,
      error: {
        code: "N8N_WEBHOOK_NOT_CONFIGURED",
        message: "N8N_WEBHOOK_URL is not configured.",
      },
    };
  }

  const n8nClient = createHttpClient({
    headers: serverEnv.n8nWebhookSecret
      ? { "x-keobong-secret": serverEnv.n8nWebhookSecret }
      : undefined,
  });

  return n8nClient.post<N8nWorkflowResponse, N8nWorkflowEvent<TPayload>>(
    serverEnv.n8nWebhookUrl,
    event,
  );
}
