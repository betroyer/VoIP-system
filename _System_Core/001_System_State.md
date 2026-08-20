# Current System State

> Point agents at the active spec + plan. Workflow: [[006_AI_Directed_Engineering]]

## Active initiative

| Field | Link |
|-------|------|
| **Active Spec** | [[specs/2026-08-20_call-center-contact-inbox]] |
| **Active Plan** | [[plans/active/2026-08-20_call-center-contact-inbox]] |
| **Status** | `build` — Contact + Inbox UI shipped; Twilio env + `messages.sql` still needed for live PC calls/SMS |

## Active feature / sprint

- **Current focus:** Call-center from the PC (Contact dialer, Inbox SMS)
- **Latest shipped:** Dial pad, Inbox threads, Twilio Voice/SMS wiring (2026-08-20)
- **Next:** Run `supabase/messages.sql`; add Twilio + service role env on Vercel; verify caller ID `+639171392170`

## Current todo

- [x] Contact page (dial pad)
- [x] Inbox threads + composer
- [x] Twilio Voice token/TwiML + inbound SMS webhook
- [ ] Run `messages.sql` on Supabase
- [ ] Twilio account, TwiML App, verified caller ID
- [ ] Vercel env: `TWILIO_*` + `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Disable public sign-up; staff Auth users
- [ ] Connect GitHub repo to Vercel GitHub app

## Known blockers

- **PC audio/SMS:** Will not leave the computer until Twilio keys are set.
- **Inbox table:** Sending fails until `public.messages` exists.
- **Inbound SMS:** Needs Twilio number webhook + service role key.
- **Vercel Git:** CLI deploy works; `git push` auto-deploy needs the GitHub app.
