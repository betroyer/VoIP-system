"use client";

import { sendCustomerSms, type SmsActionState } from "@/lib/actions";
import { SMS_TEMPLATES, statusLabelForSms } from "@/lib/sms-templates";
import { defaultSmsBody } from "@/lib/phone-links";
import type { ParcelStatus } from "@/lib/types";
import { useActionState, useEffect, useState } from "react";

const initial: SmsActionState = { error: null };

export function CustomerMessaging({
  customerName,
  customerPhone,
  orderId,
  parcelStatus,
  trackingNumber,
  twilioSms,
}: {
  customerName: string;
  customerPhone: string;
  orderId: string;
  parcelStatus: ParcelStatus;
  trackingNumber?: string | null;
  twilioSms: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(() =>
    defaultSmsBody(customerName, parcelStatus, trackingNumber),
  );
  const [state, formAction, pending] = useActionState(sendCustomerSms, initial);

  useEffect(() => {
    if (state.smsLink) {
      window.location.href = state.smsLink;
    }
    if (state.sent) {
      setOpen(false);
    }
  }, [state.smsLink, state.sent]);

  function applyTemplate(templateId: string) {
    const template = SMS_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    setBody(
      template.build({
        customerName,
        statusLabel: statusLabelForSms(parcelStatus),
        tracking: trackingNumber,
      }),
    );
  }

  return (
    <div className="rounded-lg border border-line bg-background p-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm font-medium text-accent hover:underline"
      >
        {open ? "Hide message" : "Message customer"}
      </button>

      {open ? (
        <form action={formAction} className="mt-3 grid gap-3">
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="phone_number" value={customerPhone} />
          <label className="grid gap-1 text-sm">
            Template
            <select
              className="rounded-md border border-line bg-white px-3 py-2"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyTemplate(event.target.value);
              }}
            >
              <option value="">Choose a template…</option>
              {SMS_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            SMS text
            <textarea
              name="body"
              required
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="rounded-md border border-line bg-white px-3 py-2"
            />
          </label>
          {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
          {state.sent ? (
            <p className="text-sm text-emerald-800">SMS sent and logged.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {pending
                ? "Sending…"
                : twilioSms
                  ? "Send SMS from system"
                  : "Open SMS app to send"}
            </button>
          </div>
          {!twilioSms ? (
            <p className="text-xs text-muted">
              Opens your device SMS app using the business SIM. For browser-only SMS,
              add Twilio env vars on Vercel (see README).
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
