import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
