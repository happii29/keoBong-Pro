import type { Enums, Tables } from "@/services/supabase";

export type PlayerManagementRole = Enums<"team_role">;
export type PlayerManagementPlayer = Tables<"players">;

export type PlayerFormState = {
  error?: string;
  message?: string;
};
