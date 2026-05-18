import type { IconComponent } from "@/types/icon";

export type WorkspaceNavItem = {
  key: string;
  label: string;
  shortLabel?: string;
  href: (teamSlug: string) => string;
  icon: IconComponent;
  exact?: boolean;
};
