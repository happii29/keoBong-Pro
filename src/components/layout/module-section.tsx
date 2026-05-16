import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ModuleSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ModuleSection({ children, className }: ModuleSectionProps) {
  return (
    <section className={cn("space-y-4 sm:space-y-5", className)}>
      {children}
    </section>
  );
}
