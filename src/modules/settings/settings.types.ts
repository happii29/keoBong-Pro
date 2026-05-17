export type AutomationWorkflowKey =
  | "auto-create-match"
  | "send-attendance-link"
  | "remind-pending-attendance"
  | "lock-match"
  | "calculate-fund"
  | "update-ranking";

export type AutomationStatus = "ready" | "scheduled" | "paused" | "warning";

export type AutomationWorkflow = {
  key: AutomationWorkflowKey;
  name: string;
  description: string;
  schedule: string;
  status: AutomationStatus;
  enabled: boolean;
  nextRun: string;
  webhookEvent: string;
};
