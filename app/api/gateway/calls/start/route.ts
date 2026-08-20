import { startGatewayCall } from "@/lib/gateway";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        phoneNumber?: string;
        customerName?: string;
        orderId?: string;
      }
    | null;

  const phoneNumber = body?.phoneNumber?.trim() ?? "";
  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const result = await startGatewayCall(phoneNumber, {
    customerName: body?.customerName ?? null,
    orderId: body?.orderId ?? null,
    staffId: user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    providerId: result.providerId ?? null,
    message: result.message ?? "Call request sent to the gateway bridge.",
  });
}
