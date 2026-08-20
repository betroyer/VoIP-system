import { CopyButton } from "@/components/copy-button";
import { getBusinessPhone } from "@/lib/business-phone";
import { formatPhone } from "@/lib/format";

export function BusinessPhoneBanner({ compact = false }: { compact?: boolean }) {
  const phone = getBusinessPhone();
  const display = formatPhone(phone);

  if (compact) {
    return (
      <span
        className="hidden rounded-md border border-white/20 px-2.5 py-1 font-mono text-xs text-white/90 md:inline-block"
        title="Outbound caller ID — business SIM"
      >
        From {display}
      </span>
    );
  }

  return (
    <aside className="rounded-xl border border-line bg-card px-4 py-3 shadow-sm">
      <p className="text-sm font-medium">Business line (shared by all staff)</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-lg font-semibold tracking-tight">{display}</span>
        <CopyButton value={phone} label="Copy" />
      </div>
      <p className="mt-2 text-sm text-muted">
        Staff use <strong>Call from this PC</strong> (headset) or <strong>Message customer</strong>.
        Caller ID is {display} when Twilio has that number verified. Up to 10 staff share this
        line — every call is logged.
      </p>
    </aside>
  );
}
