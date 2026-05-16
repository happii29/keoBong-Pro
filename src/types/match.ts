import type { EntityId, ISODateString } from "@/types/common";
import type { TeamId } from "@/types/team";

export type MatchId = EntityId<"MatchId">;

export type MatchStatus = "draft" | "scheduled" | "completed" | "cancelled";

export type Match = {
  id: MatchId;
  teamId: TeamId;
  opponentName?: string;
  venueName?: string;
  startsAt: ISODateString;
  status: MatchStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
