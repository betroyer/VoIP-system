import { BrowserCallButton } from "@/components/browser-call-button";
import { CustomerMessaging } from "@/components/customer-messaging";
import { formatPhone } from "@/lib/format";
import { telLink } from "@/lib/phone-links";
import type { ParcelStatus } from "@/lib/types";

export function ContactActions({
  customerName,
  customerPhone,
  orderId,
  parcelStatus,
  trackingNumber,
  twilioSms,
  voiceReady,
  callerIdDisplay,
}: {
  customerName: string;
  customerPhone: string;
  orderId: string;
  parcelStatus: ParcelStatus;
  trackingNumber?: string | null;
  twilioSms: boolean;
  voiceReady: boolean;
  callerIdDisplay: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <BrowserCallButton
          customerPhone={customerPhone}
          customerName={customerName}
          orderId={orderId}
          voiceReady={voiceReady}
          callerIdDisplay={callerIdDisplay}
        />
        <a
          href={telLink(customerPhone)}
          className="inline-flex items-center rounded-md border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-background"
        >
          Call on phone
        </a>
        <span className="inline-flex items-center rounded-md border border-line bg-white px-3 py-2 font-mono text-sm">
          {formatPhone(customerPhone)}
        </span>
      </div>
      <CustomerMessaging
        customerName={customerName}
        customerPhone={customerPhone}
        orderId={orderId}
        parcelStatus={parcelStatus}
        trackingNumber={trackingNumber}
        twilioSms={twilioSms}
      />
    </div>
  );
}
