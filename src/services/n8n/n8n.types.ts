import type { ISODateString } from "@/types/common";
import type { TeamId } from "@/types/team";

export type N8nWorkflowName =
  | "match.created"
  | "attendance.requested"
  | "payment.reminder"
  | "weekly.summary";

export type N8nWorkflowEvent<TPayload = unknown> = {
  id: string;
  name: N8nWorkflowName;
  teamId: TeamId;
  payload: TPayload;
  createdAt: ISODateString;
};

export type N8nWorkflowResponse = {
  workflowId?: string;
  accepted: boolean;
};
