import { labelStatus } from "@/lib/format";
import type { ParcelStatus } from "@/lib/types";

/** Normalize Philippine mobile numbers for tel:/sms: links. */
export function normalizePhoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("63")) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

export function telLink(phone: string) {
  return `tel:${normalizePhoneDigits(phone)}`;
}

export function smsLink(phone: string, body: string) {
  const normalized = normalizePhoneDigits(phone);
  const query = body ? `?body=${encodeURIComponent(body)}` : "";
  return `sms:${normalized}${query}`;
}

/** E.164 for SMS APIs (Twilio). */
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

export function defaultSmsBody(
  customerName: string,
  parcelStatus: ParcelStatus,
  tracking?: string | null,
) {
  const status = labelStatus(parcelStatus);
  const trackingBit = tracking ? ` Ref: ${tracking}.` : "";
  return `Hi ${customerName}, update on your parcel (${status}).${trackingBit} — Customer Contact`;
}
