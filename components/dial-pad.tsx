"use client";

import { BrowserCallButton } from "@/components/browser-call-button";
import { inboxPath, isPhilippineNumber, phoneKey } from "@/lib/phone-links";
import { formatPhone } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"] as const;

export function DialPad({
  voiceReady,
  callerIdDisplay,
}: {
  voiceReady: boolean;
  callerIdDisplay: string;
}) {
  const router = useRouter();
  const [digits, setDigits] = useState("");

  const phone = useMemo(() => phoneKey(digits), [digits]);
  const valid = phone.length > 0 && isPhilippineNumber(phone);

  function press(key: string) {
    setDigits((current) => (current + key).replace(/[^\d*#]/g, "").slice(0, 15));
  }

  return (
    <div className="mx-auto grid max-w-sm gap-5">
      <label className="grid gap-1 text-sm">
        Number to call
        <input
          inputMode="tel"
          autoComplete="tel"
          value={digits}
          onChange={(event) => setDigits(event.target.value)}
          placeholder="09xx xxx xxxx"
          className="rounded-md border border-line bg-white px-3 py-3 text-center font-mono text-xl tracking-wide"
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className="rounded-xl border border-line bg-card py-4 text-xl font-medium hover:bg-background"
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-center gap-2">
        {valid ? (
          <BrowserCallButton
            customerPhone={phone}
            voiceReady={voiceReady}
            callerIdDisplay={callerIdDisplay}
            label="Call"
          />
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center rounded-md bg-stone-400 px-4 py-2 text-sm font-medium text-white"
          >
            Call
          </button>
        )}
        <button
          type="button"
          onClick={() => setDigits((current) => current.slice(0, -1))}
          className="rounded-md border border-line bg-white px-4 py-2 text-sm hover:bg-background"
        >
          Delete
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() => router.push(inboxPath(phone))}
          className="rounded-md border border-line bg-white px-4 py-2 text-sm hover:bg-background disabled:opacity-50"
        >
          Open inbox
        </button>
      </div>

      {digits && !valid ? (
        <p className="text-center text-sm text-danger">Use a Philippine mobile number.</p>
      ) : null}

      {valid ? (
        <p className="text-center text-xs text-muted">
          Will dial {formatPhone(phone)}. Allow the microphone when the browser asks.
        </p>
      ) : null}
    </div>
  );
}
