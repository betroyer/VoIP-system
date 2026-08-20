import { isTwilioConfigured, isTwilioVoiceConfigured } from "@/lib/twilio";
import { isAdminConfigured } from "@/lib/supabase/admin";

export function CallCenterSetupBanner() {
  const voice = isTwilioVoiceConfigured();
  const sms = isTwilioConfigured();
  const inbound = isAdminConfigured();

  if (voice && sms && inbound) {
    return null;
  }

  return (
    <aside className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      <p className="font-medium">Call center from this PC needs Twilio</p>
      <ul className="mt-1 list-disc pl-5">
        {!voice ? <li>Voice: add Twilio API key + TwiML App (see README).</li> : null}
        {!sms ? (
          <li>SMS: add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.</li>
        ) : null}
        {!inbound ? (
          <li>Inbox replies: add SUPABASE_SERVICE_ROLE_KEY (server only) for inbound webhooks.</li>
        ) : null}
      </ul>
      <p className="mt-1">
        A computer has no SIM. Unli on the physical phone does not carry these calls.
      </p>
    </aside>
  );
}
