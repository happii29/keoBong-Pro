import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-white/12 bg-white/[0.055] px-3.5 py-2 text-sm text-foreground shadow-luxury outline-none backdrop-blur-xl transition-all duration-200",
        "placeholder:text-muted-foreground/70",
        "focus:border-emerald/45 focus:bg-white/[0.075] focus:ring-3 focus:ring-emerald/14",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:ring-destructive/18",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
