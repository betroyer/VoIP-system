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
- **Latest shipped:** Dial tab + Inbox/Contacts/Orders; web Contact/Inbox removed (redirect to `/releases`)
- **Next:** Test on target Android phone; inbound SMS reliability; call logging + recording

## Current todo

- [x] Flutter project in `mobile/`
- [x] Bottom nav: Dial / Inbox / Contacts / Orders
- [x] Supabase login + data fetch
- [x] Android SMS send + direct call (permissions)
- [x] Remove web Contact/Inbox call center (redirect to install)
- [ ] Run `messages.sql` if not applied
- [ ] Test on exact staff phone model(s)
- [ ] Inbound SMS → Supabase sync (harden)
- [ ] Call outcomes → `contact_logs`
- [ ] Recording + consent prompt (device-dependent)

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
