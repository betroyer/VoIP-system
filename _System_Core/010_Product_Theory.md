# Product Theory — Customer Contact System

> Source: call-center spec + Plan v3 phone fallback. Technical how-to: [[000_System_Architecture]].

## Vision

A cheap, private web dashboard so staff can contact local Philippine customers about parcels **from a computer** (Contact + Inbox) or from a **business phone** (SIM **09171392170** + Unli All-Net).

## Who uses it

| User | Jobs |
|------|------|
| **Staff** | Dial from Contact, text from Inbox, work the parcel Queue |
| **Customer** | Receives call/SMS on TNT / Smart / Globe — they never log in |

## Domain principles

1. **PH only** — `+63` / `09` destinations.
2. **PC agents need a gateway/PBX bridge** — the office SIM handles SMS/voice, not the browser.
3. **Phone agents stay cheap** — Unli on the physical SIM still works via `tel:` / `sms:`.
4. **Private by login** — Supabase Auth; no public sign-up.
5. **Consent if recording** — RA 4200.

## How call/SMS works

| Action | Behavior |
|--------|----------|
| **Contact → Call** | The dashboard asks the office gateway / PBX to place the call |
| **Inbox → Send** | The dashboard asks the gateway to send SMS; inbound webhook fills the thread |
| **Call on phone** | Opens the device phone app (`tel:`) on SIM 09171392170 |

## Non-goals

- Auto-dialer / ACD / IVR
- Non-PH numbers
- Customer self-serve portal
- Public registration

## Feature specs

- [[specs/TEMPLATE_Feature_Spec]]
- [[specs/2026-08-20_customer-contact-system]]
- [[specs/2026-08-20_call-center-contact-inbox]]
