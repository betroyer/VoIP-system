"use client";

import { useState } from "react";

type Option = { value: string; label: string };

export function OutcomeFields({
  contactTypes,
  callOutcomes,
  smsOutcomes,
}: {
  contactTypes: Option[];
  callOutcomes: Option[];
  smsOutcomes: Option[];
}) {
  const [type, setType] = useState("call");
  const outcomes = type === "sms" ? smsOutcomes : callOutcomes;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm">
        Contact type
        <select
          name="contact_type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2"
        >
          {contactTypes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Outcome
        <select
          name="outcome"
          required
          className="rounded-md border border-line bg-white px-3 py-2"
          key={type}
          defaultValue=""
        >
          <option value="" disabled>
            Select outcome
          </option>
          {outcomes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
