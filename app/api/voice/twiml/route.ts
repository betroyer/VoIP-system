import { getOutboundCallerId, isPhilippineNumber } from "@/lib/twilio";
import { toE164 } from "@/lib/phone-links";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return new NextResponse("Voice is not configured.", { status: 503 });
  }

  const signature = request.headers.get("x-twilio-signature") ?? "";
  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });

  const url = process.env.TWILIO_VOICE_WEBHOOK_URL?.trim() || request.url;
  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    return new NextResponse("Invalid Twilio signature.", { status: 403 });
  }

  const toRaw = params.To ?? params.to ?? "";
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (!isPhilippineNumber(toRaw)) {
    twiml.say(
      { language: "en-US" },
      "This system can only call Philippine numbers.",
    );
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const callerId = getOutboundCallerId();
  const dial = twiml.dial({
    callerId,
    answerOnBridge: true,
    timeout: 30,
  });
  dial.number(toE164(toRaw));

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
