import { createClient } from "@/lib/supabase/server";
import { createVoiceAccessToken } from "@/lib/twilio-voice";
import { isTwilioVoiceConfigured } from "@/lib/twilio";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isTwilioVoiceConfigured()) {
    return NextResponse.json(
      { error: "In-browser calling is not set up yet. Add Twilio Voice env vars." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const identity = `staff-${user.id}`;
  const token = createVoiceAccessToken(identity);
  return NextResponse.json({ token, identity });
}
