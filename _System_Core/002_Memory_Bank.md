# Project Change Log & Memory Bank

> Timeline for **this** Customer Contact project only. Say **"save to memory bank"** in Cursor after chat-driven fixes.

## Recent log entries

### 2026-08-20 — In-browser PC calling (Twilio Voice)

Staff can **Call from this PC** with microphone. TwiML dials PH numbers only; caller ID env `TWILIO_CALLER_ID` defaults toward `+639943282611`. Unli SIM cannot carry PC audio — Twilio minutes apply after keys are set.

**Key files:** `components/browser-call-button.tsx`, `app/api/voice/token/route.ts`, `app/api/voice/twiml/route.ts`

### 2026-08-20 — Call and Message from the dashboard

Added **Call customer** and **Message customer** on Queue and Order pages. SMS templates + optional Twilio server send; without Twilio, Message opens the device SMS app. Product theory updated: up to 10 staff, one shared business line.

**Key files:** `components/contact-actions.tsx`, `components/customer-messaging.tsx`, `lib/actions.ts` (`sendCustomerSms`)

### 2026-08-20 — Business phone 09943282611 in dashboard

Set `NEXT_PUBLIC_BUSINESS_PHONE=09943282611` (local + Vercel). Queue page and header show the business SIM staff should use for outbound calls/SMS. Still manual on the physical phone — not web dialing.

**Key files:** `lib/business-phone.ts`, `components/business-phone-banner.tsx`, `.env.example`

### 2026-08-20 — Obsidian memory bank created

Added a second, separate vault at `_System_Core/` plus `.obsidian/` so this project is not stored in the Brent/PYX memory bank. Cursor rule `.cursor/rules/ai-directed-engineering.mdc` points agents here.

**Key files:** `_System_Core/`, `.obsidian/`, `.cursor/rules/ai-directed-engineering.mdc`

### 2026-08-20 — Vercel connected to Supabase and first production deploy

Logged into Vercel as **betroyer** (team `betroyers-projects`). Created project `voip-system`, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production / Preview / Development, deployed production.

- Live: https://voip-system.vercel.app
- GitHub auto-connect failed until the Vercel GitHub app is installed

**Key files:** `.env.local` (local only), Vercel project env

### 2026-08-20 — Schema applied on Supabase

Ran `supabase/schema.sql` on project `dphjtppwsdjbbrmaofje` via Management API. Tables `staff`, `customers`, `orders`, `contact_logs` exist with RLS. Private bucket `call-recordings` created. Anon key saved to `.env.local`.

**Key files:** `supabase/schema.sql`

### 2026-08-20 — Customer contact dashboard built

Next.js 16 app: login, today's queue, customers, orders, contact logs, optional recording upload. Manual call/SMS only. RA 4200 disclosure shown on the queue.

**Key files:** `app/`, `components/`, `lib/`, `proxy.ts`

### 2026-08-20 — GitHub repo on betroyer

Initialized this folder as its own git repo (not `C:\Users\Admin`). Local `user.name=betroyer`. Pushed to https://github.com/betroyer/VoIP-system.git over HTTPS. SSH key on this PC is not authorized for GitHub.

**Key files:** `.git/config` (local)
