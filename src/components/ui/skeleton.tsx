import type * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.07]",
        "after:absolute after:inset-y-0 after:left-0 after:w-1/2 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-white/12 after:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
