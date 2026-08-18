import { redirect } from "next/navigation";

import { AcceptInviteCard } from "@/modules/invites/components/accept-invite-card";
import { isSupabaseConfigured } from "@/services/supabase";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  if (!isSupabaseConfigured()) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/invite/${token}`)}`);
  }

  return <AcceptInviteCard token={token} />;
}
