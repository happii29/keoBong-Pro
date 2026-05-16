import { Clock3, Goal, ThumbsDown, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AttendanceStatus } from "../attendance.types";

type AttendanceButtonGroupProps = {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
};

const actions = [
  {
    status: "going",
    label: "Tôi đi",
    icon: ThumbsUp,
    activeClass: "border-emerald/35 bg-emerald/14 text-emerald shadow-emerald",
  },
  {
    status: "absent",
    label: "Tôi nghỉ",
    icon: ThumbsDown,
    activeClass: "border-destructive/35 bg-destructive/14 text-destructive",
  },
  {
    status: "late",
    label: "Tôi đến muộn",
    icon: Clock3,
    activeClass: "border-gold/35 bg-gold/14 text-gold shadow-gold",
  },
  {
    status: "goalkeeper",
    label: "Tôi bắt gôn",
    icon: Goal,
    activeClass: "border-gold/35 bg-gold/14 text-gold shadow-gold",
  },
] as const;

export function AttendanceButtonGroup({
  value,
  onChange,
}: AttendanceButtonGroupProps) {
  return (
    <div className="premium-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="premium-kicker">Phản hồi của tôi</p>
          <h3 className="mt-1 font-display text-xl font-semibold">
            Bạn có đi trận này không?
          </h3>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const active = value === action.status;

          return (
            <Button
              key={action.status}
              type="button"
              variant="luxury"
              className={cn(
                "h-14 justify-start px-3 sm:h-16 sm:flex-col sm:justify-center",
                active && action.activeClass,
              )}
              onClick={() => onChange(action.status)}
            >
              <Icon className="size-4" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
