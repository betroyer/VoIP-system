import { isGatewayWebhookAuthorized } from "@/lib/gateway";
import { phoneKey } from "@/lib/phone-links";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

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
        from?: string;
        body?: string;
        providerId?: string | null;
      }
    | null;

  const from = phoneKey(payload?.from ?? "");
  const body = payload?.body?.trim() ?? "";

  if (!from || !body) {
    return NextResponse.json({ error: "Missing from/body." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: customers, error: customerError } = await admin
    .from("customers")
    .select("id, phone_number")
    .limit(500);

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  const match = (customers ?? []).find(
    (customer) => phoneKey(customer.phone_number) === from,
  );

  const { error } = await admin.from("messages").insert({
    phone_number: from,
    customer_id: match?.id ?? null,
    staff_id: null,
    direction: "inbound",
    body,
    provider_sid: payload?.providerId ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
