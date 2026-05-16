import type { EntityId, ISODateString, UserId } from "@/types/common";

export type TeamId = EntityId<"TeamId">;

export type TeamPlan = "free" | "pro" | "club";

export type TeamRole = "owner" | "manager" | "captain" | "member" | "viewer";

export type Team = {
  id: TeamId;
  name: string;
  slug: string;
  plan: TeamPlan;
  timezone: string;
  zaloGroupId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type TeamMembership = {
  teamId: TeamId;
  userId: UserId;
  role: TeamRole;
  joinedAt: ISODateString;
};
