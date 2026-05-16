import type { ReactNode } from "react";

import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { TopBar } from "@/components/app/top-bar";

type WorkspaceShellProps = {
  children: ReactNode;
  teamSlug: string;
};

export function WorkspaceShell({ children, teamSlug }: WorkspaceShellProps) {
  return (
    <div className="luxury-shell-bg min-h-svh">
      <SidebarNav teamSlug={teamSlug} />
      <div className="flex min-h-svh flex-col lg:pl-72">
        <TopBar teamSlug={teamSlug} />
        <main className="flex-1 pb-24 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            {children}
          </div>
        </main>
        <MobileBottomNav teamSlug={teamSlug} />
      </div>
    </div>
  );
}
