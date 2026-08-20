# Product Theory — Customer Contact System

> Source: Customer_Contact_System_Plan_v3.docx. Technical how-to: [[000_System_Architecture]].

## Vision

A cheap, private web dashboard so staff can contact local Philippine customers about parcel status using a **business phone** (SIM **09943282611** + Unli All-Net). The site is the list and the logbook. Calls and texts are **not** placed by Twilio or any international VoIP API.

## Who uses it

| User | Jobs |
|------|------|
| **Staff** | Open queue, call/text from the business phone, log outcome |
| **Customer** | Receives call/SMS on TNT / Smart / Globe — they never log in |

## Domain principles

1. **Local and low-cost** — Unli All-Net promo, not per-minute APIs.
2. **Manual contact** — staff dial and text from the phone with 09943282611.
3. **Private by login** — Supabase Auth; no public sign-up.
4. **Upgrade later without a rewrite** — data layer survives a future SMS gateway if volume ever requires it.
5. **Consent if recording** — RA 4200.

## How call/SMS works

| Action | Behavior |
|--------|----------|
| **Call customer** | Opens the device phone app (`tel:`). Use the dashboard **on the business phone** so the call uses 09943282611 + Unli. |
| **Message customer** | Opens the device SMS app with a template. Same SIM. Then log the outcome in the dashboard. |

## Non-goals (unless a new spec says otherwise)

- Twilio / international VoIP
- GSM modem / auto-dialer
- Customer self-serve portal
- Public registration

## Feature specs

- [[specs/TEMPLATE_Feature_Spec]]
- [[specs/2026-08-20_customer-contact-system]]
