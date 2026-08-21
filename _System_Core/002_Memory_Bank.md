# Project Change Log & Memory Bank

> Timeline for **this** Customer Contact project only. Say **"save to memory bank"** in Cursor after chat-driven fixes.

## Recent log entries

### 2026-08-21 — Call recording for parcel proof

Outgoing calls show RA 4200 consent, start mic recording, dial via SIM, then upload to Supabase Storage `call-recordings` + `call_recordings` table (run `supabase/call_recordings.sql`). Speakerphone recommended; full duplex cellular audio is not available to third-party apps.

**Key files:** `mobile/lib/screens/active_call_screen.dart`, `mobile/lib/services/recording_service.dart`

### 2026-08-21 — Settings: changeable business number

Android app Settings (gear on Dial/Inbox/Contacts/Orders) lets staff save another PH business SIM number (SharedPreferences). Dial shows the current line. Reminder: traffic still uses the physical SIM in the phone.

**Key files:** `mobile/lib/screens/settings_screen.dart`, `mobile/lib/services/settings_service.dart`

### 2026-08-21 — Mobile-only call/SMS; web Contact/Inbox removed

Staff confirmed PC web dial/SMS is a dead end. Product path is **Android app only** (SIM in phone). Added **Dial** tab (call + message). Web `/contact` and `/inbox` redirect to `/releases`. Queue keeps copy-number + “install app” only.

**Key files:** `mobile/lib/screens/dial_screen.dart`, `app/contact/page.tsx`, `app/inbox/`, `README.md`

### 2026-08-20 — Contact Call no longer blocked without gateway

Without `GATEWAY_BRIDGE_URL`, **Call** opens the device dialer (`tel:`) instead of a disabled “setup needed” state. Banner points staff to the business SIM / Android `/releases` app. Optional office gateway still works when configured.

**Key files:** `components/browser-call-button.tsx`, `components/call-center-setup-banner.tsx`

### 2026-08-20 — Plan v7: Flutter Android app scaffold

Primary product is now an **Android Flutter app** (`mobile/`) using the device SIM — no PC dashboard, no gateway hardware. Inbox/Contacts/Orders + Supabase auth; SMS/call via Android APIs.

**Key files:** `mobile/lib/`, `_System_Core/specs/2026-08-20_android-flutter-plan-v7.md`

### 2026-08-20 — Gateway bridge scaffold + mock driver running locally

Added `gateway-bridge/` with SPEC, mock SMS/call driver, and webhook forwarding. Bridge runs on port 3001; dashboard `.env.local` points to `http://127.0.0.1:3001`.

**Key files:** `gateway-bridge/SPEC.md`, `gateway-bridge/src/server.ts`

### 2026-08-20 — Switched PC calling/SMS from Twilio to gateway-ready bridge

Adopted Plan v6: one business SIM in a gateway box, with the dashboard calling a local bridge/PBX instead of Twilio. Added gateway webhook routes for inbound SMS and call events, and updated Contact/Inbox UI copy to match the hardware path.

**Key files:** `lib/gateway.ts`, `app/api/gateway/`, `components/browser-call-button.tsx`, `README.md`

### 2026-08-20 — Call center Contact + Inbox (from PC)

Staff asked for computer calling and Messenger-style SMS. Added **Contact** (dial pad) and **Inbox** (threads + call). Twilio Voice/SMS is required for the PC path; Unli SIM remains phone fallback. Plan v3 is superseded for desktop agents by spec `2026-08-20_call-center-contact-inbox`.

**Key files:** `app/contact/`, `app/inbox/`, `app/api/voice/`, `app/api/sms/incoming/`, `supabase/messages.sql`

### 2026-08-20 — Business phone set to 09171392170

Outbound SIM shown in the dashboard is now **09171392170** (was 09943282611).

### 2026-08-20 — Removed Twilio; back to Plan v3

In-browser Twilio Voice/SMS was a detour. Plan v3 forbids international VoIP APIs. Calls and texts are again **manual on the business phone** (09943282611 + Unli). Dashboard = queue + logbook.

**Key files:** removed `app/api/voice/`, `lib/twilio*.ts`, `@twilio/voice-sdk`

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
