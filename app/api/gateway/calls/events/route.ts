import { isGatewayWebhookAuthorized } from "@/lib/gateway";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const allowedOutcomes = new Set(["answered", "no_answer", "busy", "failed"]);

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required." },
      { status: 503 },
    );
  }

  if (!isGatewayWebhookAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        orderId?: string;
        staffId?: string;
        phoneNumber?: string;
        outcome?: string;
        notes?: string | null;
      }
    | null;

  const orderId = payload?.orderId?.trim() ?? "";
  const staffId = payload?.staffId?.trim() ?? "";
  const outcome = payload?.outcome?.trim() ?? "";

  if (!orderId || !staffId || !allowedOutcomes.has(outcome)) {
    return NextResponse.json({ error: "Missing orderId/staffId/outcome." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("contact_logs").insert({
    order_id: orderId,
    staff_id: staffId,
    contact_type: "call",
    outcome,
    notes: payload?.notes?.trim() || `Gateway call to ${payload?.phoneNumber ?? "customer"}`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
