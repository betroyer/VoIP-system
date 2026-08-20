import { ALL_OUTCOMES, CONTACT_TYPES, NETWORKS, PARCEL_STATUSES } from "@/lib/constants";
import type { ContactOutcome, ContactType, Network, ParcelStatus } from "@/lib/types";

const manilaDate = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  dateStyle: "medium",
});

const manilaDateTime = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value: string) {
  return manilaDate.format(new Date(value));
}

export function formatDateTime(value: string) {
  return manilaDateTime.format(new Date(value));
}

export function manilaTodayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(
    new Date(),
  );
}

export function manilaStartOfTodayIso() {
  return `${manilaTodayIso()}T00:00:00+08:00`;
}

export function labelNetwork(value: Network) {
  return NETWORKS.find((item) => item.value === value)?.label ?? value;
}

export function labelStatus(value: ParcelStatus) {
  return PARCEL_STATUSES.find((item) => item.value === value)?.label ?? value;
}

export function labelContactType(value: ContactType) {
  return CONTACT_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function labelOutcome(value: ContactOutcome) {
  return ALL_OUTCOMES.find((item) => item.value === value)?.label ?? value;
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("09")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return value;
}
