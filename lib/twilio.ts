import { getBusinessPhone } from "@/lib/business-phone";
import { toE164 } from "@/lib/phone-links";

export function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
}

/** Browser calling (Twilio Voice / WebRTC) needs a TwiML App + API key. */
export function isTwilioVoiceConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_API_KEY_SID &&
      process.env.TWILIO_API_KEY_SECRET &&
      process.env.TWILIO_TWIML_APP_SID &&
      (process.env.TWILIO_CALLER_ID || process.env.TWILIO_PHONE_NUMBER),
  );
}

/** Number customers see as caller ID. Prefer verified business mobile. */
export function getOutboundCallerId() {
  const raw =
    process.env.TWILIO_CALLER_ID?.trim() ||
    process.env.TWILIO_PHONE_NUMBER?.trim() ||
    getBusinessPhone();
  return toE164(raw);
}

export function isPhilippineNumber(phone: string) {
  const e164 = toE164(phone);
  return /^\+63\d{9,10}$/.test(e164);
}

export async function sendTwilioSms(to: string, body: string) {
  if (!isTwilioConfigured()) {
    return { ok: false as const, error: "Twilio is not configured." };
  }

  if (!isPhilippineNumber(to)) {
    return { ok: false as const, error: "SMS is limited to Philippine numbers." };
  }

  const { default: Twilio } = await import("twilio");
  const { toE164: toIntl } = await import("@/lib/phone-links");

  const client = Twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: toIntl(to),
    });
    return { ok: true as const, sid: message.sid };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "SMS failed.";
    return { ok: false as const, error: msg };
  }
}
