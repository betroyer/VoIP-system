import { CopyButton } from "@/components/copy-button";
import { getBusinessPhone } from "@/lib/business-phone";
import { formatPhone } from "@/lib/format";
import Link from "next/link";

export function BusinessPhoneBanner({ compact = false }: { compact?: boolean }) {
  const phone = getBusinessPhone();
  const display = formatPhone(phone);

  if (compact) {
    return (
      <span
        className="hidden rounded-md border border-white/20 px-2.5 py-1 font-mono text-xs text-white/90 md:inline-block"
        title="Business SIM — use Android staff app"
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
        <Link
          href="/releases"
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Install Android app
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        Put this SIM in the staff Android phone. Call and SMS from the app — not from
        this website.
      </p>
    </aside>
  );
}
