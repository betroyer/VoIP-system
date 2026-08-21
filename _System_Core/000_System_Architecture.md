# System Architecture & Core Rules

## Project Overview

- **Project Name:** Customer Contact System (repo folder: VoIP system)
- **Primary Goal:** **Android Flutter app** so staff text/call parcel customers from the business phone SIM, sync to Supabase, with best-effort call recording.
- **Legacy:** Next.js web dashboard + gateway-bridge (Plans v3–v6) — not the primary product.

## Tech stack

| Layer | Choice |
|-------|--------|
| Mobile app | **Flutter / Dart** (Android only) |
| Auth + DB + storage | Supabase (Postgres, Auth, Storage, RLS) |
| Contact | Device SIM — Android SMS + telephony APIs |
| Legacy web | Next.js on Vercel (archived path) |

## Accounts (keep separate from Brent/PYX)

| Service | This project | Do not mix with |
|---------|--------------|-----------------|
| GitHub | **betroyer** | diobrandedd |
| Git author (local) | `betroyer` / `delossantosbrent69@gmail.com` | global `diobrandedd` |
| Supabase | project `dphjtppwsdjbbrmaofje` | Brent project `jrmieezescbvvttnttdp` |
| Vercel | team **betroyers-projects**, project **voip-system** | other Vercel teams |

## Folder structure

- `_System_Core/` → Obsidian memory bank (**no application code**)
- `mobile/` → **Plan v7** Flutter Android staff app
- `app/` → Legacy Next.js dashboard (not primary)
- `gateway-bridge/` → Legacy office LAN bridge (not primary)
- `components/` → Dashboard UI
- `lib/` → Supabase clients, server actions, types
- `gateway-bridge/` → Local SIM gateway / PBX bridge service (office LAN)
- `supabase/schema.sql` → Tables, RLS, storage bucket (already applied)

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | `https://dphjtppwsdjbbrmaofje.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Public anon key (RLS-protected) |
| `NEXT_PUBLIC_BUSINESS_PHONE` | `.env.local` + Vercel | Fallback SIM shown in the UI (`09171392170`) |
| `GATEWAY_BRIDGE_URL` | `.env.local` + Vercel (server) | Local office bridge for the SIM gateway / PBX |
| `GATEWAY_API_KEY` | `.env.local` + Vercel (server) | Shared secret for bridge requests/webhooks |
| `GATEWAY_CALLER_ID` | `.env.local` + Vercel | Business SIM shown as PC caller ID |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel (server only) | Inbound SMS webhook inserts |

Never commit `.env.local`, service role, or `sbp_` personal access tokens.

## Live URLs

- App: https://voip-system.vercel.app
- GitHub: https://github.com/betroyer/VoIP-system
- Supabase: https://supabase.com/dashboard/project/dphjtppwsdjbbrmaofje
- Vercel: https://vercel.com/betroyers-projects/voip-system

## Critical rules

- Follow [[specs/2026-08-20_android-flutter-plan-v7]] for the primary product.
- Read [[001_System_State]] before new features.
- Log shipped work in [[002_Memory_Bank]].
- Document traps in [[003_Fragile_Edges]].
- Public sign-up stays off.

## Connected notes

- Workflow: [[006_AI_Directed_Engineering]]
- Product theory: [[010_Product_Theory]]
- Change log: [[002_Memory_Bank]]
- Fragile edges: [[003_Fragile_Edges]]
