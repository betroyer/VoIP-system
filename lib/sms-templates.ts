import type { ParcelStatus } from "@/lib/types";

export type SmsTemplate = {
  id: string;
  label: string;
  build: (ctx: { customerName: string; statusLabel: string; tracking?: string | null }) => string;
};

export const SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: "parcel-update",
    label: "Parcel status update",
    build: ({ customerName, statusLabel, tracking }) => {
      const trackingBit = tracking ? ` Tracking: ${tracking}.` : "";
      return `Hi ${customerName}, update on your parcel: ${statusLabel}.${trackingBit} Reply if you have questions. — Customer Contact`;
    },
  },
  {
    id: "out-for-delivery",
    label: "Out for delivery",
    build: ({ customerName }) =>
      `Hi ${customerName}, your parcel is out for delivery today. Please keep your phone available. — Customer Contact`,
  },
  {
    id: "follow-up",
    label: "Follow-up / no answer",
    build: ({ customerName }) =>
      `Hi ${customerName}, we tried to reach you about your parcel. Please call or text us back when you can. — Customer Contact`,
  },
];

export function statusLabelForSms(status: ParcelStatus) {
  const map: Record<ParcelStatus, string> = {
    pending: "Pending",
    packed: "Packed",
    in_transit: "In transit",
    out_for_delivery: "Out for delivery",
    awaiting_customer: "Awaiting your confirmation",
    delayed: "Delayed",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}
