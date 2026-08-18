import type { Enums, Tables } from "@/services/supabase";

export type FinanceRole = Enums<"team_role">;
export type FinanceTransaction = Tables<"fund_transactions"> & {
  matchLabel: string | null;
  playerName: string | null;
};

export type FinancePlayer = Pick<
  Tables<"players">,
  "id" | "display_name" | "shirt_number" | "user_id" | "status"
>;

export type FinanceMatch = Pick<
  Tables<"matches">,
  "id" | "opponent_name" | "venue_name" | "starts_at" | "status"
>;

export type MatchPaymentPlayer = {
  playerId: string;
  name: string;
  shirtNumber: number | null;
  paidAmount: number;
  dueAmount: number;
  debtAmount: number;
  isCurrentUser: boolean;
};

export type MatchPaymentSummary = {
  matchId: string;
  matchLabel: string;
  startsAt: string;
  totalExpense: number;
  duePerPlayer: number;
  paidTotal: number;
  debtTotal: number;
  players: MatchPaymentPlayer[];
};

export type FundFormState = {
  error?: string;
  message?: string;
};
