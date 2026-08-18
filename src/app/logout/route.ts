import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/services/supabase";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

export async function GET() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signOut();
  }

  redirect("/login");
}
