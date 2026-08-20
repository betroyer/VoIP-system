import { isAdminConfigured, createAdminClient } from "@/lib/supabase/admin";
import { phoneKey } from "@/lib/phone-links";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken || !isAdminConfigured()) {
    return new NextResponse("Inbound SMS is not configured.", { status: 503 });
  }

  const signature = request.headers.get("x-twilio-signature") ?? "";
  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });

  const url = process.env.TWILIO_SMS_WEBHOOK_URL?.trim() || request.url;
  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    return new NextResponse("Invalid Twilio signature.", { status: 403 });
  }

  const from = phoneKey(params.From ?? params.from ?? "");
  const body = (params.Body ?? params.body ?? "").trim();
  const sid = params.MessageSid ?? params.SmsSid ?? null;

  if (!from || !body) {
    return new NextResponse("Missing From or Body.", { status: 400 });
  }

  const admin = createAdminClient();
  const { data: customer } = await admin
    .from("customers")
    .select("id, phone_number")
    .limit(200);

  const match = (customer ?? []).find((row) => phoneKey(row.phone_number) === from);

  const { error } = await admin.from("messages").insert({
    phone_number: from,
    customer_id: match?.id ?? null,
    staff_id: null,
    direction: "inbound",
    body,
    provider_sid: sid,
  });

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();
  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
