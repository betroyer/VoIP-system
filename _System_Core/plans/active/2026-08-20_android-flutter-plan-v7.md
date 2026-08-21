# Active plan — Android Flutter (Plan v7)

**Spec:** [[../../specs/2026-08-20_android-flutter-plan-v7]]

## Approach

1. New app in `mobile/` (Flutter, Android-only).
2. Reuse Supabase project `dphjtppwsdjbbrmaofje`.
3. Wire Android telephony for SMS/calls; recording last.
4. Web is **install + optional logbook only** — no PC call/SMS. Gateway-bridge is abandoned.

## Done when

- [x] Flutter project + bottom nav (Dial / Inbox / Contacts / Orders)
- [x] Supabase login shell
- [x] Dial pad: Call + Message via device SIM
- [x] Web Contact/Inbox removed (redirect to `/releases`)
- [ ] SMS on device SIM hardened on target phones
- [ ] Calls on device SIM + contact_logs
- [ ] Recording tested on target phone model
