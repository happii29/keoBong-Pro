"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { workspaceNavigation } from "@/config/navigation";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  teamSlug: string;
};

export function MobileBottomNav({ teamSlug }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/82 shadow-luxury backdrop-blur-2xl supports-[backdrop-filter]:bg-background/72 lg:hidden"
      aria-label="Điều hướng chính"
    >
      <div className="safe-bottom flex h-[4.25rem] gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {workspaceNavigation.map((item) => {
          const href = item.href(teamSlug);
          const Icon = item.icon;
          const active = isActivePath({ pathname, href, exact: item.exact });

          return (
            <Link
              key={item.key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-[4.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition-all duration-200",
                active
                  ? "text-emerald"
                  : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
              )}
            >
              {active ? (
                <span className="absolute top-1 h-0.5 w-7 rounded-full bg-gold" />
              ) : null}
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="w-full truncate text-center leading-none">
                {item.shortLabel ?? item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
