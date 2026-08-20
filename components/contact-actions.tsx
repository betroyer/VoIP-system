import { BrowserCallButton } from "@/components/browser-call-button";
import { CustomerMessaging } from "@/components/customer-messaging";
import { getBusinessPhone } from "@/lib/business-phone";
import { formatPhone } from "@/lib/format";
import { getCallerIdDisplay, isGatewayConfigured } from "@/lib/gateway";
import { inboxPath, telLink } from "@/lib/phone-links";
import type { ParcelStatus } from "@/lib/types";
import Link from "next/link";

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
      <div className="flex flex-wrap items-start gap-2">
        <BrowserCallButton
          customerPhone={customerPhone}
          customerName={customerName}
          orderId={orderId}
          voiceReady={isGatewayConfigured()}
          callerIdDisplay={getCallerIdDisplay()}
          label="Call from this PC"
        />
        <a
          href={telLink(customerPhone)}
          className="inline-flex items-center rounded-md border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-background"
        >
          Call on phone
        </a>
        <Link
          href={inboxPath(customerPhone)}
          className="inline-flex items-center rounded-md border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-background"
        >
          Open inbox
        </Link>
        <span className="inline-flex items-center rounded-md border border-line bg-white px-3 py-2 font-mono text-sm">
          {formatPhone(customerPhone)}
        </span>
      </div>
      <p className="text-xs text-muted">
        PC call/SMS goes through your SIM gateway box. Physical phone fallback still
        uses {formatPhone(getBusinessPhone())}.
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
