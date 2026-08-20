# System Architecture & Core Rules

## Project Overview

- **Project Name:** Customer Contact System (repo folder: VoIP system)
- **Primary Goal:** Private web dashboard so staff can **call and text from a computer** (Contact + Inbox) like a small call center, and still log parcel follow-up. Physical SIM **09171392170** + Unli remains a fallback (`tel:` / `sms:`).
- **Not:** Auto-dialer / IVR. International (non-PH) numbers.

## Tech stack

| Layer | Choice |
|-------|--------|
| Web app | Next.js 16 (App Router) + React 19 + Tailwind 4 |
| Auth + DB + storage | Supabase (Postgres, Auth, Storage, RLS) |
| Hosting | Vercel (`betroyers-projects` / `voip-system`) |
| GitHub | `betroyer/VoIP-system` (HTTPS remote) |
| Contact | Twilio Voice (PC) or business phone + Unli |

## Accounts (keep separate from Brent/PYX)

| Service | This project | Do not mix with |
|---------|--------------|-----------------|
| GitHub | **betroyer** | diobrandedd |
| Git author (local) | `betroyer` / `delossantosbrent69@gmail.com` | global `diobrandedd` |
| Supabase | project `dphjtppwsdjbbrmaofje` | Brent project `jrmieezescbvvttnttdp` |
| Vercel | team **betroyers-projects**, project **voip-system** | other Vercel teams |

## Folder structure

- `_System_Core/` → Obsidian memory bank (**no application code**)
- `app/` → Next.js routes (`/`, `/contact`, `/inbox`, `/login`, `/customers`, `/orders`, `/logs`)
- `components/` → Dashboard UI
- `lib/` → Supabase clients, server actions, types
- `proxy.ts` → Next.js 16 auth gate (Supabase session)
- `supabase/schema.sql` → Tables, RLS, storage bucket (already applied)

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | `https://dphjtppwsdjbbrmaofje.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Public anon key (RLS-protected) |
| `NEXT_PUBLIC_BUSINESS_PHONE` | `.env.local` + Vercel | Fallback SIM shown in the UI (`09171392170`) |
| `TWILIO_*` | `.env.local` + Vercel (server) | PC calling and SMS |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel (server only) | Inbound SMS webhook inserts |

Never commit `.env.local`, service role, or `sbp_` personal access tokens.

## Live URLs

- App: https://voip-system.vercel.app
- GitHub: https://github.com/betroyer/VoIP-system
- Supabase: https://supabase.com/dashboard/project/dphjtppwsdjbbrmaofje
- Vercel: https://vercel.com/betroyers-projects/voip-system

## Critical rules

- Follow [[specs/2026-08-20_call-center-contact-inbox]] for PC Contact/Inbox. Plan v3 phone-only is still valid as a fallback.
- Read [[001_System_State]] before new features.
- Log shipped work in [[002_Memory_Bank]].
- Document traps in [[003_Fragile_Edges]].
- Public sign-up stays off.

## Connected notes

- Workflow: [[006_AI_Directed_Engineering]]
- Product theory: [[010_Product_Theory]]
- Change log: [[002_Memory_Bank]]
- Fragile edges: [[003_Fragile_Edges]]
