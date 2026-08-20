import { labelStatus } from "@/lib/format";
import type { ParcelStatus } from "@/lib/types";

/** Canonical 09XXXXXXXXX key for inbox URLs and matching. */
export function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length >= 12) {
    return `0${digits.slice(2)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `0${digits}`;
  }
  return digits;
}

export function inboxPath(phone: string) {
  return `/inbox/${phoneKey(phone)}`;
}

/** Normalize Philippine mobile numbers for tel:/sms: links. */
export function normalizePhoneDigits(phone: string) {
  return phoneKey(phone);
}

export function telLink(phone: string) {
  return `tel:${normalizePhoneDigits(phone)}`;
}

export function smsLink(phone: string, body: string) {
  const normalized = normalizePhoneDigits(phone);
  const query = body ? `?body=${encodeURIComponent(body)}` : "";
  return `sms:${normalized}${query}`;
}

/** E.164 for tel:/sms: links (PH mobiles). */
export function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `+63${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `+63${digits}`;
  }
  return `+${digits}`;
}

export function isPhilippineNumber(phone: string) {
  const e164 = toE164(phone);
  return /^\+63\d{9,10}$/.test(e164);
}

export function defaultSmsBody(
  customerName: string,
  parcelStatus: ParcelStatus,
  tracking?: string | null,
) {
  const status = labelStatus(parcelStatus);
  const trackingBit = tracking ? ` Ref: ${tracking}.` : "";
  return `Hi ${customerName}, update on your parcel (${status}).${trackingBit} — Customer Contact`;
}
