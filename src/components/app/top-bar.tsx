import { Bell, LogOut, Search } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import { formatTeamSlug } from "@/lib/format";

type TopBarProps = {
  teamSlug: string;
};

export function TopBar({ teamSlug }: TopBarProps) {
  const teamName = formatTeamSlug(teamSlug);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/78 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/68">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="premium-kicker lg:hidden">{appConfig.name}</p>
          <h1 className="truncate font-display text-base font-semibold sm:text-lg">
            {teamName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Tìm kiếm">
            <Search className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Thông báo">
            <Bell className="size-4" />
          </Button>
          <ThemeToggle />
          <form action="/logout" method="post">
            <Button type="submit" variant="ghost" size="icon" aria-label="Dang xuat">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
