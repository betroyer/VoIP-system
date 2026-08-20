import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export async function requireStaff() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function StaffPage({ children }: { children: ReactNode }) {
  const session = await requireStaff();
  if (!session) {
    return (
      <div className="flex min-h-full items-center px-4 py-16">
        <SetupNotice />
      </div>
    );
  }

  return <AppShell email={session.user.email ?? ""}>{children}</AppShell>;
}
