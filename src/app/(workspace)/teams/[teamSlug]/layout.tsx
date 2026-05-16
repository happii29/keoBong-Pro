import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/app/workspace-shell";

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

  return <WorkspaceShell teamSlug={teamSlug}>{children}</WorkspaceShell>;
}
