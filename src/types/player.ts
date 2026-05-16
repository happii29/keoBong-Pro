import type { EntityId, ISODateString, UserId } from "@/types/common";
import type { TeamId } from "@/types/team";

export type PlayerId = EntityId<"PlayerId">;

export type PlayerStatus = "active" | "injured" | "paused" | "left";

export type Player = {
  id: PlayerId;
  teamId: TeamId;
  userId?: UserId;
  displayName: string;
  phone?: string;
  shirtNumber?: number;
  status: PlayerStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
