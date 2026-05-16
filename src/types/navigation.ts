import type { LucideIcon } from "lucide-react";

export type WorkspaceNavItem = {
  key: string;
  label: string;
  shortLabel?: string;
  href: (teamSlug: string) => string;
  icon: LucideIcon;
  exact?: boolean;
};
