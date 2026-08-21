# Current System State

> Point agents at the active spec + plan. Workflow: [[006_AI_Directed_Engineering]]

## Active initiative

| Field | Link |
|-------|------|
| **Active Spec** | [[specs/2026-08-20_android-flutter-plan-v7]] |
| **Active Plan** | [[plans/active/2026-08-20_android-flutter-plan-v7]] |
| **Status** | `build` — Android app is the only call/SMS surface |

## Active feature / sprint

- **Current focus:** Android Flutter app on business SIM (Plan v7)
- **Latest shipped:** Dial + Settings + call recording (consent → mic → upload)
- **Next:** Run `call_recordings.sql` on Supabase; test recording on target phone model(s)

## Current todo

- [x] Flutter project in `mobile/`
- [x] Bottom nav: Dial / Inbox / Contacts / Orders
- [x] Supabase login + data fetch
- [x] Android SMS send + direct call (permissions)
- [x] Remove web Contact/Inbox call center (redirect to install)
- [x] Call recording + RA 4200 consent dialog + Storage upload
- [ ] Run `supabase/call_recordings.sql` on Supabase
- [ ] Run `messages.sql` if not applied
- [ ] Test recording on exact staff phone model(s) (speakerphone)
## Web (secondary)

- `/releases` — APK install page
- Queue / Orders / Customers / Logs — optional logbook only (no PC dial/SMS)

## Legacy (do not extend)

- `gateway-bridge/` (Plan v6)
- Web Contact/Inbox UI (redirects only)

## Known blockers

- **iOS:** Out of scope — Apple blocks SIM SMS/call APIs for third-party apps.
- **Recording:** Unreliable on many Android 10+ devices — must test hardware first.
- **Staff login:** Need Supabase Auth users with sign-up disabled.
