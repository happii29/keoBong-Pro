import type { TeamId } from "@/types/team";

export type ZaloMiniAppContext = {
  miniAppId: string;
  userAccessToken?: string;
};

export type ZaloGroupBinding = {
  teamId: TeamId;
  groupId: string;
  groupName?: string;
};
