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
        title="Business SIM for Unli All-Net calls and texts"
      >
        {display}
      </span>
    );
  }

  return (
    <aside className="rounded-xl border border-line bg-card px-4 py-3 shadow-sm">
      <p className="text-sm font-medium">Business phone (Unli All-Net SIM)</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-lg font-semibold tracking-tight">{display}</span>
        <CopyButton value={phone} label="Copy" />
      </div>
      <p className="mt-2 text-sm text-muted">
        Unli All-Net still applies when you call from this physical SIM. Calls from the
        computer (Contact / Inbox) must pass through your office gateway/PBX setup.
      </p>
    </aside>
  );
}
