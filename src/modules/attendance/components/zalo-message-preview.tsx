import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AttendanceCounts, AttendancePlayer } from "../attendance.types";

type ZaloMessagePreviewProps = {
  players: AttendancePlayer[];
  counts: AttendanceCounts;
};

export function ZaloMessagePreview({ players, counts }: ZaloMessagePreviewProps) {
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => {
    const goingNames = players
      .filter((player) => player.status === "going" || player.status === "goalkeeper")
      .map((player) => player.name)
      .join(", ");
    const lateNames = players
      .filter((player) => player.status === "late")
      .map((player) => player.name)
      .join(", ");
    const pendingNames = players
      .filter((player) => player.status === "pending")
      .map((player) => player.name)
      .join(", ");

    return [
      "KeoBong Pro - Điểm danh trận tối nay",
      "Thứ 7, 20:30 - Sân Phú Thọ Sân 3",
      "",
      `Đã đi: ${counts.going + counts.goalkeeper}`,
      `Đến muộn: ${counts.late}`,
      `Nghỉ: ${counts.absent}`,
      `Chưa phản hồi: ${counts.pending}`,
      "",
      `Danh sách đi: ${goingNames || "Chưa có"}`,
      lateNames ? `Đến muộn: ${lateNames}` : null,
      pendingNames ? `Nhắc phản hồi: ${pendingNames}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [players, counts]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Zalo message preview</CardTitle>
          <MessageCircle className="size-5 text-emerald" />
        </div>
      </CardHeader>
      <CardContent>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 font-sans text-sm leading-6 text-muted-foreground">
          {message}
        </pre>
        <Button
          type="button"
          variant={copied ? "emerald" : "gold"}
          size="lg"
          className="mt-4 w-full"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Đã copy" : "Copy Zalo message"}
        </Button>
      </CardContent>
    </Card>
  );
}
