"use client";

import { sendCustomerSms, type SmsActionState } from "@/lib/actions";
import { SMS_TEMPLATES, statusLabelForSms } from "@/lib/sms-templates";
import { getBusinessPhone } from "@/lib/business-phone";
import { formatPhone } from "@/lib/format";
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
}: {
  customerName: string;
  customerPhone: string;
  orderId: string;
  parcelStatus: ParcelStatus;
  trackingNumber?: string | null;
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
  }, [state.smsLink]);

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
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send from this PC"}
          </button>
          <p className="text-xs text-muted">
            With Twilio, the text leaves this computer. Without it, this opens the phone SMS
            app for SIM {formatPhone(getBusinessPhone())}.
          </p>
          {state.sent ? <p className="text-sm text-accent">Message sent.</p> : null}
        </form>
      ) : null}
    </div>
  );
}
