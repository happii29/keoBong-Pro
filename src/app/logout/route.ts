import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/services/supabase";
import { createSupabaseServerClient } from "@/services/supabase/server-client";

export function GET() {
  redirect("/login");
}

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signOut();
  }

  redirect("/login");
}
