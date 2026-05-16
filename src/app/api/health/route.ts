import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "keobong-pro",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
