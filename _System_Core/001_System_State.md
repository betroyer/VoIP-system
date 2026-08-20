# Current System State

> Point agents at the active spec + plan. Workflow: [[006_AI_Directed_Engineering]]

## Active initiative

| Field | Link |
|-------|------|
| **Active Spec** | [[specs/2026-08-20_call-center-contact-inbox]] |
| **Active Plan** | [[plans/active/2026-08-20_call-center-contact-inbox]] |
| **Status** | `build` — gateway/PBX-ready Contact + Inbox shipped; local bridge + `messages.sql` still needed for live PC calls/SMS |

## Active feature / sprint

- **Current focus:** Call-center from the PC through a SIM gateway / PBX bridge
- **Latest shipped:** Dial pad, Inbox threads, gateway-ready SMS/call routes (2026-08-20)
- **Next:** Run `supabase/messages.sql`; add `GATEWAY_*` + service role env on Vercel; connect the bridge to the chosen hardware

## Current todo

- [x] Contact page (dial pad)
- [x] Inbox threads + composer
- [x] Gateway bridge routes + inbound webhook endpoints
- [ ] Run `messages.sql` on Supabase
- [ ] Buy/configure gateway hardware and PBX/bridge
- [ ] Vercel env: `GATEWAY_*` + `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Disable public sign-up; staff Auth users
- [ ] Connect GitHub repo to Vercel GitHub app

## Known blockers

- **PC audio/SMS:** Will not leave the computer until the gateway bridge is running and reachable.
- **Inbox table:** Sending fails until `public.messages` exists.
- **Inbound SMS:** Needs the bridge / PBX to POST to the gateway webhook routes.
- **Vercel Git:** CLI deploy works; `git push` auto-deploy needs the GitHub app.
