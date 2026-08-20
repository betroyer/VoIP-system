"use client";

import { logBrowserCall } from "@/lib/actions";
import { toE164 } from "@/lib/phone-links";
import { Device, type Call } from "@twilio/voice-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "connecting" | "ringing" | "in-call" | "error";

export function BrowserCallButton({
  customerPhone,
  customerName,
  orderId,
  voiceReady,
  callerIdDisplay,
}: {
  customerPhone: string;
  customerName: string;
  orderId: string;
  voiceReady: boolean;
  callerIdDisplay: string;
}) {
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const connectedRef = useRef(false);

  const teardown = useCallback(() => {
    callRef.current?.disconnect();
    callRef.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      callRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, []);

  async function ensureDevice() {
    if (deviceRef.current) {
      return deviceRef.current;
    }
    const res = await fetch("/api/voice/token");
    const data = (await res.json()) as { token?: string; error?: string };
    if (!res.ok || !data.token) {
      throw new Error(data.error ?? "Could not start calling.");
    }
    const device = new Device(data.token, { logLevel: "error" });
    await device.register();
    deviceRef.current = device;
    return device;
  }

  async function startCall() {
    setError(null);
    setStatus("connecting");
    try {
      const device = await ensureDevice();
      const call = await device.connect({
        params: { To: toE164(customerPhone) },
      });
      callRef.current = call;

      connectedRef.current = false;
      call.on("ringing", () => setStatus("ringing"));
      call.on("accept", () => {
        connectedRef.current = true;
        setStatus("in-call");
      });
      call.on("disconnect", () => {
        void logBrowserCall({
          orderId,
          customerPhone,
          outcome: connectedRef.current ? "answered" : "no_answer",
          notes: `In-browser call to ${customerName} (${customerPhone}) as ${callerIdDisplay}`,
        });
        callRef.current = null;
        setStatus("idle");
      });
      call.on("cancel", () => {
        void logBrowserCall({
          orderId,
          customerPhone,
          outcome: "no_answer",
          notes: `Call cancelled to ${customerName}`,
        });
        teardown();
      });
      call.on("error", (err) => {
        setError(err.message);
        setStatus("error");
        void logBrowserCall({
          orderId,
          customerPhone,
          outcome: "failed",
          notes: err.message,
        });
      });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Call failed.");
    }
  }

  if (!voiceReady) {
    return (
      <div className="grid gap-2">
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center rounded-md bg-stone-400 px-4 py-2 text-sm font-medium text-white"
        >
          Call from PC (setup needed)
        </button>
        <p className="max-w-md text-xs text-muted">
          In-browser calling uses Twilio Voice so you can dial from this PC. Add
          Twilio Voice keys (see README), verify caller ID{" "}
          <span className="font-mono">{callerIdDisplay}</span>, then redeploy.
          Until then, Call still works from the business phone browser.
        </p>
      </div>
    );
  }

  const inProgress = status === "connecting" || status === "ringing" || status === "in-call";
  const label =
    status === "connecting"
      ? "Connecting…"
      : status === "ringing"
        ? "Ringing…"
        : status === "in-call"
          ? "In call — Hang up"
          : "Call from this PC";

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={() => (inProgress ? teardown() : void startCall())}
        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
          inProgress ? "bg-danger hover:bg-red-800" : "bg-accent hover:bg-accent-hover"
        }`}
      >
        {label}
      </button>
      <p className="text-xs text-muted">
        Customer hears caller ID {callerIdDisplay}. Allow microphone when the
        browser asks.
      </p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
