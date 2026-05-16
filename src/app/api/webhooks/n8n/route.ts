import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/lib/env/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expectedSecret = serverEnv.n8nWebhookSecret;
  const receivedSecret = request.headers.get("x-keobong-secret");

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized n8n webhook request." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => null);

  return NextResponse.json(
    {
      accepted: true,
      event: payload?.event ?? "unknown",
      receivedAt: new Date().toISOString(),
    },
    { status: 202 },
  );
}
