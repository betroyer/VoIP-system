import twilio from "twilio";
import { isTwilioVoiceConfigured } from "@/lib/twilio";

export function createVoiceAccessToken(identity: string) {
  if (!isTwilioVoiceConfigured()) {
    throw new Error("Twilio Voice is not configured.");
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY_SID!,
    process.env.TWILIO_API_KEY_SECRET!,
    { identity, ttl: 3600 },
  );

  token.addGrant(
    new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID!,
      incomingAllow: false,
    }),
  );

  return token.toJwt();
}
