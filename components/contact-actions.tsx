import { telLink } from "@/lib/phone-links";
import { formatPhone } from "@/lib/format";
import type { ParcelStatus } from "@/lib/types";
import { CustomerMessaging } from "@/components/customer-messaging";

export function ContactActions({
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
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={telLink(customerPhone)}
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Call customer
        </a>
        <span className="inline-flex items-center rounded-md border border-line bg-white px-3 py-2 font-mono text-sm">
          {formatPhone(customerPhone)}
        </span>
      </div>
      <p className="text-xs text-muted">
        Call and SMS go out on the business phone (0994 328 2611) with your Unli
        promo — not through an internet VoIP API.
      </p>
      <CustomerMessaging
        customerName={customerName}
        customerPhone={customerPhone}
        orderId={orderId}
        parcelStatus={parcelStatus}
        trackingNumber={trackingNumber}
      />
    </div>
  );
}
