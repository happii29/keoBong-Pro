import { CircleDot } from "lucide-react";

import { cn } from "@/lib/utils";

export function SoccerLoader({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-4 place-items-center", className)} aria-hidden="true">
      <CircleDot className="size-4 animate-spin text-current" />
      <span className="absolute size-1.5 rounded-full bg-current" />
    </span>
  );
}
