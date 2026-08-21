---
status: active
supersedes: Plan v6 (PC dashboard + gateway hardware)
---

# Spec — Plan v7: Android Flutter staff app (SIM on device)

## Goal

Staff text and call parcel customers from an **Android phone** with the business SIM inside. Sync to Supabase. Best-effort call recording. **No PC dashboard. No gateway hardware.**

## Platform

- **Android only** — iOS cannot send SMS, place calls, or access call audio from third-party apps.
- Stack: **Flutter / Dart**

## Architecture

| Layer | Role |
|-------|------|
| **Flutter app** (`mobile/`) | Inbox, Contacts, Orders; SIM SMS/calls; upload logs + recordings |
| **Supabase** | Auth, Postgres, Storage (`call-recordings`) |

## Screens

- **Inbox** — threads, send SMS, Call button
- **Contacts** — customer list, dial icon
- **Orders** — parcel status per customer

## Data (reuse existing Supabase)

- `customers`, `messages`, `orders`, `contact_logs` (call/SMS log), `staff`
- Recordings: `contact_logs.recording_link` → Storage path

## Phases

1. [x] Flutter skeleton + nav + Supabase auth
2. [ ] Live SMS send/receive on Android SIM
3. [ ] Live calls + log to `contact_logs`
4. [ ] Recording + RA 4200 consent prompt (device-dependent)
5. [ ] Orders polish + background sync

## Out of scope

- iOS
- PC web dashboard as primary (legacy Next.js may remain archived)
- GOIP / PBX / gateway bridge as primary path
