# Product Theory — Customer Contact System

> **Plan v7 (primary):** Android Flutter app on business SIM. Web is install + optional logbook only — no PC dial/SMS.

## Vision

Staff contact Philippine parcel customers by **text and call from an Android phone** with the business SIM (Call & Text load). Activity syncs to Supabase. Best-effort call recording when the device supports it.

## Who uses it

| User | Jobs |
|------|------|
| **Staff (Android)** | Dial, Inbox SMS, call customers, update parcel orders |
| **Customer** | Receives SMS/calls on their mobile — never logs in |

## Platform

- **Android only** — iOS cannot access SIM SMS/call/recording APIs for third-party apps.
- **Flutter / Dart** in `mobile/`
- **Web** — `/releases` APK install + optional Queue/Orders/Logs (no telephony)

## Domain principles

1. **Normal handset use** — SIM stays in a real phone; lower telco FUP risk than gateway hardware.
2. **PH numbers only**
3. **Supabase sync** — messages, contact logs, recordings (Storage)
4. **Recording is bonus** — `contact_logs` outcome + notes are the reliable record
5. **RA 4200** — consent notice at call start

## Non-goals (Plan v7)

- iOS app
- PC call center / web Contact / web Inbox telephony
- GOIP / PBX / gateway box
- Auto-dialer / IVR
- Telnyx / Twilio / other metered CPaaS

## Feature specs

- [[specs/2026-08-20_android-flutter-plan-v7]]
- [[specs/2026-08-20_customer-contact-system]] (Plan v3 — historical)
- [[specs/2026-08-20_call-center-contact-inbox]] (PC path — retired)
