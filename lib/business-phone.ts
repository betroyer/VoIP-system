/** Digits-only business SIM used for outbound calls and SMS (Unli promo on this line). */
export function getBusinessPhone() {
  const raw =
    process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim() || "09171392170";
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : "09171392170";
}
