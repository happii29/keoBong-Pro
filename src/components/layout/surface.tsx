import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function Surface({ children, className }: SurfaceProps) {
  return (
    <div className={cn("premium-card p-4 sm:p-6", className)}>
      {children}
    </div>
  );
}
