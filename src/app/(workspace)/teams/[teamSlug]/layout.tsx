import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/app/workspace-shell";
import { requireTeamWorkspaceAccess } from "@/modules/auth/guards";

type TeamWorkspaceLayoutProps = {
  children: ReactNode;
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function TeamWorkspaceLayout({
  children,
  params,
}: TeamWorkspaceLayoutProps) {
  const { teamSlug } = await params;

  await requireTeamWorkspaceAccess(teamSlug);

  return <WorkspaceShell teamSlug={teamSlug}>{children}</WorkspaceShell>;
}
