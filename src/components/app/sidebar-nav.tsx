"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appConfig } from "@/config/app";
import { workspaceNavigation } from "@/config/navigation";
import { formatTeamSlug } from "@/lib/format";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  teamSlug: string;
};

export function SidebarNav({ teamSlug }: SidebarNavProps) {
  const pathname = usePathname();
  const teamName = formatTeamSlug(teamSlug);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border bg-sidebar/92 text-sidebar-foreground shadow-luxury backdrop-blur-2xl lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex size-11 items-center justify-center rounded-xl border border-gold/28 bg-gold/12 text-sm font-bold text-gold shadow-gold">
          KB
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold">{appConfig.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            {teamName}
          </p>
        </div>
      </div>
      <div className="mx-5 gold-divider" />
      <nav className="flex-1 space-y-1.5 px-3 py-5" aria-label="Điều hướng đội">
        {workspaceNavigation.map((item) => {
          const href = item.href(teamSlug);
          const Icon = item.icon;
          const active = item.exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all duration-200",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active
                  ? "border border-emerald/25 bg-emerald/14 text-emerald shadow-emerald"
                  : "text-sidebar-foreground/78",
              )}
            >
              <Icon
                className="size-4 shrink-0 transition-transform group-hover:scale-105"
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
