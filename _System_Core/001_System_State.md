# Current System State

> Point agents at the active spec + plan. Workflow: [[006_AI_Directed_Engineering]]

## Active initiative

| Field | Link |
|-------|------|
| **Active Spec** | [[specs/2026-08-20_customer-contact-system]] |
| **Active Plan** | — |
| **Status** | `setup` — data layer + dashboard deployed; staff logins still needed |

## Active feature / sprint

- **Current focus:** Follow Plan v3 — Unli phone workflow, staff logins, no Twilio
- **Latest shipped:** Next.js dashboard, schema on Supabase, Vercel production with env vars (2026-08-20)
- **Next:** Create two Auth users; turn off sign-up; install Vercel GitHub app; optional custom subdomain

## Current todo

- [x] Local git identity for **betroyer** (this repo only)
- [x] GitHub repo `betroyer/VoIP-system`
- [x] Apply `supabase/schema.sql` to project `dphjtppwsdjbbrmaofje`
- [x] Save anon key in `.env.local`
- [x] Deploy to Vercel with Supabase env vars
- [ ] Create exactly two Supabase Auth users (owner + coworker)
- [ ] Disable public sign-up in Supabase Auth
- [ ] Connect GitHub repo to Vercel (GitHub app install)
- [ ] Load Unli All-Net promo on SIM 09943282611 (Phase 3)
- [ ] Call recording + RA 4200 disclosure in daily use (Phase 4)

## Known blockers

- **Staff login:** Dashboard is live but nobody can sign in until two users exist in [Auth → Users](https://supabase.com/dashboard/project/dphjtppwsdjbbrmaofje/auth/users).
- **Vercel Git:** CLI deploy works; `git push` does not auto-deploy until the [Vercel GitHub app](https://github.com/apps/vercel/installations/new) is installed on `betroyer/VoIP-system`.
- **Access token:** A Supabase PAT was used in chat to run SQL — rotate it at [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) if it is still active.
