---
status: active
supersedes: Plan v3 phone-only for computer agents
---

# Spec — Call center: Contact + Inbox (from PC)

## Problem

Staff work at a computer like a small call center. They need to **dial a number and talk**, and keep an **SMS inbox** like Messenger — not only a parcel queue.

## Why a gateway bridge is required

A PC has no SIM. Unli on **09171392170** cannot carry the call directly from the browser on Windows. Computer calling/SMS needs a **local bridge** to a GSM gateway or PBX that holds the business SIM. That bridge handles both SMS and call control while the SIM provides the number identity and load.

Plan v3 (phone + Unli, no API) remains valid for agents who work **on the physical phone**. This spec is the **PC agent** path through a single office gateway box.

## Users

Staff (up to ~10). PH customers only (`+63` / `09`).

## Navigation

| Item | Purpose |
|------|---------|
| **Contact** | Dial pad — type or tap a PH number, **Call** from this PC through the gateway / PBX |
| **Inbox** | Threaded SMS like Messenger — send/receive, **Call** from the thread |
| Queue / Orders / Customers / Logs | Unchanged parcel workflow |

## Success criteria

- [ ] `/contact` dialer requests a call through the office gateway bridge
- [ ] `/inbox` lists conversations; staff send SMS from the thread
- [ ] Inbound SMS (gateway/PBX webhook) appears in Inbox
- [ ] Destinations limited to Philippine numbers
- [ ] `GATEWAY_*` env documented; UI shows setup state if bridge keys are missing

## Out of scope

- Full ACD/IVR / queue routing
- Video
- International (non-PH) numbers
