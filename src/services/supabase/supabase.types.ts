import type { TeamId, TeamRole } from "@/types/team";
import type { UserId } from "@/types/common";

export type SupabaseTenantContext = {
  teamId: TeamId;
  role: TeamRole;
};

export type SupabaseAuthContext = {
  userId: UserId;
  email?: string;
};
