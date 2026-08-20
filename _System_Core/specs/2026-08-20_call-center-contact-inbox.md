---
status: active
supersedes: Plan v3 phone-only for computer agents
---

# Spec — Call center: Contact + Inbox (from PC)

## Problem

Staff work at a computer like a small call center. They need to **dial a number and talk**, and keep an **SMS inbox** like Messenger — not only a parcel queue.

## Why a phone API is required

A PC has no SIM. Unli on **09171392170** cannot carry the call from Chrome on Windows. Computer calling/SMS needs a **cloud phone provider** (Twilio Voice + SMS). Caller ID can be the business mobile **if Twilio verifies it**; otherwise customers see a Twilio number. Unli minutes do not apply to these calls.

Plan v3 (phone + Unli, no API) remains valid for agents who work **on the physical phone**. This spec is the **PC agent** path.

## Users

Staff (up to ~10). PH customers only (`+63` / `09`).

## Navigation

| Item | Purpose |
|------|---------|
| **Contact** | Dial pad — type or tap a PH number, **Call** from this PC (headset/mic) |
| **Inbox** | Threaded SMS like Messenger — send/receive, **Call** from the thread |
| Queue / Orders / Customers / Logs | Unchanged parcel workflow |

## Success criteria

- [ ] `/contact` dialer places a WebRTC call when Twilio Voice is configured
- [ ] `/inbox` lists conversations; staff send SMS from the thread
- [ ] Inbound SMS (Twilio webhook) appears in Inbox
- [ ] Destinations limited to Philippine numbers
- [ ] Twilio env documented; UI shows setup state if keys missing

## Out of scope

- Full ACD/IVR / queue routing
- Video
- International (non-PH) numbers
