"use client";

import { sendInboxMessage, type SmsActionState } from "@/lib/actions";
import { useActionState, useEffect, useRef } from "react";

const initial: SmsActionState = { error: null };

export function InboxComposer({
  phoneNumber,
  smsReady,
}: {
  phoneNumber: string;
  smsReady: boolean;
}) {
  const [state, formAction, pending] = useActionState(sendInboxMessage, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.sent) {
      formRef.current?.reset();
    }
    if (state.smsLink) {
      window.location.href = state.smsLink;
    }
  }, [state.sent, state.smsLink]);

  return (
    <div className="border-t border-line bg-card p-3">
      {state.error ? <p className="mb-2 text-sm text-danger">{state.error}</p> : null}
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input type="hidden" name="phone_number" value={phoneNumber} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder={
            smsReady
              ? "Type a message…"
              : "Twilio SMS not set — will open the phone SMS app"
          }
          className="min-h-[44px] flex-1 resize-none rounded-md border border-line bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="self-end rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
