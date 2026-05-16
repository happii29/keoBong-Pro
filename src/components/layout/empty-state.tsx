import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-white/12 bg-white/[0.035] px-5 py-8 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-lg border border-gold/20 bg-gold/10 text-gold">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 premium-heading text-base">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
