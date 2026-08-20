# System Architecture & Core Rules

## Project Overview

- **Project Name:** Customer Contact System (repo folder: VoIP system)
- **Primary Goal:** Private staff dashboard so up to ~10 people can **call and message PH customers from the website**, using one shared business number (**09943282611**).
- **Voice:** In-browser calling on PC via Twilio Voice (WebRTC). Destination is limited to Philippine numbers (`+63`). Caller ID is the verified business number when Twilio allows it.
- **Not (yet):** The Unli SIM itself carrying the audio from a PC. A browser cannot talk to a physical SIM without a GSM gateway. Twilio’s network places the call; Unli promo does not apply to those minutes.

## Tech stack

| Layer | Choice |
|-------|--------|
| Web app | Next.js 16 (App Router) + React 19 + Tailwind 4 |
| Auth + DB + storage | Supabase (Postgres, Auth, Storage, RLS) |
| Hosting | Vercel (`betroyers-projects` / `voip-system`) |
| GitHub | `betroyer/VoIP-system` (HTTPS remote) |
| Phone | Business number `09943282611` as caller ID; Twilio Voice for PC calling |

## Accounts (keep separate from Brent/PYX)

| Service | This project | Do not mix with |
|---------|--------------|-----------------|
| GitHub | **betroyer** | diobrandedd |
| Git author (local) | `betroyer` / `delossantosbrent69@gmail.com` | global `diobrandedd` |
| Supabase | project `dphjtppwsdjbbrmaofje` | Brent project `jrmieezescbvvttnttdp` |
| Vercel | team **betroyers-projects**, project **voip-system** | other Vercel teams |

## Folder structure

- `_System_Core/` → Obsidian memory bank (**no application code**)
- `app/` → Next.js routes (`/`, `/login`, `/customers`, `/orders`, `/logs`)
- `components/` → Dashboard UI
- `lib/` → Supabase clients, server actions, types
- `proxy.ts` → Next.js 16 auth gate (Supabase session)
- `supabase/schema.sql` → Tables, RLS, storage bucket (already applied)

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | `https://dphjtppwsdjbbrmaofje.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Public anon key (RLS-protected) |
| `NEXT_PUBLIC_BUSINESS_PHONE` | `.env.local` + Vercel | Display / intended caller ID (`09943282611`) |
| `TWILIO_ACCOUNT_SID` | Vercel + `.env.local` | Twilio account |
| `TWILIO_AUTH_TOKEN` | Vercel + `.env.local` | Twilio auth (server only) |
| `TWILIO_API_KEY_SID` / `TWILIO_API_KEY_SECRET` | Vercel + `.env.local` | Voice access tokens |
| `TWILIO_TWIML_APP_SID` | Vercel + `.env.local` | TwiML App for browser outbound |
| `TWILIO_PHONE_NUMBER` | Vercel + `.env.local` | Twilio number (fallback caller ID / SMS) |
| `TWILIO_CALLER_ID` | Vercel + `.env.local` | Verified PH number `+639943282611` |
| `TWILIO_VOICE_WEBHOOK_URL` | Vercel | Exact URL `https://voip-system.vercel.app/api/voice/twiml` |

Never commit `.env.local`, service role, or `sbp_` personal access tokens.

## Live URLs

- App: https://voip-system.vercel.app
- GitHub: https://github.com/betroyer/VoIP-system
- Supabase: https://supabase.com/dashboard/project/dphjtppwsdjbbrmaofje
- Vercel: https://vercel.com/betroyers-projects/voip-system

## Critical rules

- Read [[001_System_State]] before new features.
- Log shipped work in [[002_Memory_Bank]].
- Document traps in [[003_Fragile_Edges]].
- Calls and SMS from the dashboard; destinations are **Philippine numbers only**.
- Only two **types** of staff roles for now; create up to ~10 Auth users. Public sign-up stays off.

## Connected notes

- Workflow: [[006_AI_Directed_Engineering]]
- Product theory: [[010_Product_Theory]]
- Change log: [[002_Memory_Bank]]
- Fragile edges: [[003_Fragile_Edges]]
