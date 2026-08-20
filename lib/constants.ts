import type { ContactOutcome, ContactType, Network, ParcelStatus } from "@/lib/types";

export const NETWORKS: { value: Network; label: string }[] = [
  { value: "tnt", label: "TNT" },
  { value: "smart", label: "Smart" },
  { value: "globe", label: "Globe" },
  { value: "other", label: "Other" },
];

export const PARCEL_STATUSES: { value: ParcelStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "packed", label: "Packed" },
  { value: "in_transit", label: "In transit" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "awaiting_customer", label: "Awaiting customer" },
  { value: "delayed", label: "Delayed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "sms", label: "SMS" },
];

export const CALL_OUTCOMES: { value: ContactOutcome; label: string }[] = [
  { value: "answered", label: "Answered" },
  { value: "no_answer", label: "No answer" },
  { value: "busy", label: "Busy" },
  { value: "confirmed", label: "Confirmed" },
  { value: "declined", label: "Declined" },
  { value: "wrong_number", label: "Wrong number" },
];

export const SMS_OUTCOMES: { value: ContactOutcome; label: string }[] = [
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "wrong_number", label: "Wrong number" },
];

export const ALL_OUTCOMES: { value: ContactOutcome; label: string }[] = [
  ...CALL_OUTCOMES,
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
];

export const DISCLOSURE_SCRIPT =
  "This call may be recorded for quality purposes.";

export const STATUSES_NEEDING_CONTACT: ParcelStatus[] = [
  "pending",
  "packed",
  "in_transit",
  "out_for_delivery",
  "awaiting_customer",
  "delayed",
];
