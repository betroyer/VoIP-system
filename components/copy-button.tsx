"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-line bg-white px-2 py-1 text-xs text-muted hover:text-foreground"
    >
      {copied ? "Copied" : label ?? "Copy"}
    </button>
  );
}
