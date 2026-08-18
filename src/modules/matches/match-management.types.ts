import type { Enums, Tables } from "@/services/supabase";

export type MatchManagementMatch = Tables<"matches">;
export type MatchManagementRole = Enums<"team_role">;
export type MatchManagementPlayer = Pick<
  Tables<"players">,
  "id" | "display_name" | "shirt_number" | "position" | "status" | "user_id"
>;
export type MatchManagementAttendance = Tables<"attendance">;

export type MatchFormState = {
  error?: string;
  message?: string;
};
