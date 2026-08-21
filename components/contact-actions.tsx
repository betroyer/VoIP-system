import { CopyButton } from "@/components/copy-button";
import { formatPhone } from "@/lib/format";
import type { ParcelStatus } from "@/lib/types";
import Link from "next/link";

/** Queue helpers only — call/SMS happen in the Android app on the business SIM. */
export function ContactActions({
  customerPhone,
}: {
  customerName: string;
  customerPhone: string;
  orderId: string;
  parcelStatus: ParcelStatus;
  trackingNumber?: string | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-md border border-line bg-white px-3 py-2 font-mono text-sm">
          {formatPhone(customerPhone)}
        </span>
        <CopyButton value={customerPhone} label="Copy number" />
        <Link
          href="/releases"
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Call / text in Android app
        </Link>
      </div>
      <p className="text-xs text-muted">
        Use the staff Android app (SIM in the phone) to dial or message{" "}
        {formatPhone(customerPhone)}. Log the outcome on this page afterward.
      </p>
    </div>
  );
}
