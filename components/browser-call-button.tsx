"use client";

import { telLink } from "@/lib/phone-links";
import { useState } from "react";

type Status = "idle" | "requesting" | "requested" | "error";

export function BrowserCallButton({
  customerPhone,
  customerName,
  orderId,
  voiceReady,
  callerIdDisplay,
  label = "Call",
}: {
  customerPhone: string;
  customerName?: string;
  orderId?: string;
  voiceReady: boolean;
  callerIdDisplay: string;
  label?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function startGatewayCall() {
    setError(null);
    setStatus("requesting");
    try {
      const res = await fetch("/api/gateway/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: customerPhone,
          customerName,
          orderId,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not start calling.");
      }
      setStatus("requested");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Call failed.");
    }
  }

  // No office gateway — open the device dialer (phone / linked handset).
  if (!voiceReady) {
    return (
      <div className="grid gap-1">
        <a
          href={telLink(customerPhone)}
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          {label}
        </a>
        <p className="max-w-md text-xs text-muted">
          Opens your phone dialer. Place the call from business SIM{" "}
          <span className="font-mono">{callerIdDisplay}</span> (or the Android staff
          app).
        </p>
      </div>
    );
  }

  const buttonLabel =
    status === "requesting"
      ? "Requesting…"
      : status === "requested"
        ? "Requested"
        : label;

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={() => void startGatewayCall()}
        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
          status === "requested"
            ? "bg-emerald-700 hover:bg-emerald-800"
            : "bg-accent hover:bg-accent-hover"
        }`}
      >
        {buttonLabel}
      </button>
      {status === "requested" ? (
        <p className="text-xs text-muted">
          Call request sent to the gateway bridge. Audio continues in your PBX/SIP
          client, not inside the browser.
        </p>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
