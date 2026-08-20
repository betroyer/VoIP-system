---
status: active
source: Customer_Contact_System_Plan_v3.docx + 2026-08-20 PC calling
---

# Spec — Customer Contact System

## Problem

Staff need to **call and message PH customers from the website on a PC**, using one business number, and log outcomes.

## Users

Up to ~10 staff. Customers only receive the call/SMS.

## Success criteria

- [x] Data layer: customers, orders, contact_logs, staff
- [x] Login-only dashboard on Vercel
- [x] Queue + Call from PC (Twilio Voice) + Message + log
- [ ] Twilio Voice env configured and caller ID `+639943282611` verified
- [ ] Staff Auth users created; public sign-up off

## Business / UX rules

- Destinations: **Philippine numbers only** (`+63`).
- Caller ID: business line **09943282611** when Twilio verifies it.
- PC calling uses Twilio Voice (not Unli SIM audio).
- Privacy is authentication; no public sign-up.
- Recording: RA 4200 disclosure on calls.

## Out of scope

- International (non-PH) destinations
- Customer-facing app
- Auto-dialer blasting

## Links

- Product theory: [[010_Product_Theory]]
- Architecture: [[000_System_Architecture]]
