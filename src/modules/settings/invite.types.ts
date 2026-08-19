import type { Tables } from "@/services/supabase";

export type TeamInvite = Tables<"team_invites">;

export type CreateInviteFormState = {
  error?: string;
  inviteUrl?: string;
  message?: string;
};
