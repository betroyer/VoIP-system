---
status: active
source: Customer_Contact_System_Plan_v3.docx
---

# Spec — Customer Contact System (v3 plan)

## Problem

Staff need a private list of parcel customers to call or text about order status, then a place to log what happened — **without Twilio** or extra calling hardware.

## Users

Staff (owner + coworkers). Customers only receive the call/SMS.

## Success criteria

- [x] Data layer: customers, orders, contact_logs, staff
- [x] Login-only dashboard on Vercel
- [x] Queue of orders needing contact + Call / Message (device phone) + quick-log
- [ ] Staff Auth users created; public sign-up off
- [ ] Unli All-Net promo loaded on SIM 09171392170
- [ ] Optional recordings with RA 4200 disclosure

## Business / UX rules

- Contact is **manual** from the business phone (TNT/Smart/Globe Unli).
- Privacy is authentication, not hiding the URL.
- Monthly cost target is the Unli promo (~₱150–500), not per-minute APIs.
- Recording: say “This call may be recorded for quality purposes.” (RA 4200)

## Out of scope

- Twilio / international VoIP APIs
- Auto-dialer / GSM gateway
- Customer-facing app

## Phases

1. Data layer (Supabase) — **done**
2. Web dashboard + Vercel — **done**
3. Phone + Unli All-Net promo on 09171392170
4. Call recording + disclosure
5. Daily workflow
6. Reporting / follow-up
7. Future SMS automation only if volume requires it (not Twilio Voice)

## Links

- Product theory: [[010_Product_Theory]]
- Architecture: [[000_System_Architecture]]
