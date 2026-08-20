# Customer Contact System

Private staff dashboard for a small **PH call center on a computer**: dial from **Contact**, text from **Inbox** (Messenger-style), plus a parcel **Queue**.

## Two ways to reach customers

| Mode | How it works |
|------|----------------|
| **From this PC** | A local GSM gateway / PBX bridge uses the business SIM for SMS and voice. |
| **From the business phone** | `tel:` / `sms:` on SIM **09171392170** + Unli All-Net (Plan v3). |

A PC has no SIM, so the dashboard must hand off calls/texts to a gateway box or PBX that has the SIM.

## Navigation

- **Contact** — dial pad, call, open inbox for that number
- **Inbox** — SMS threads; Call from the conversation
- **Queue / Orders / Customers / Logs** — parcel follow-up

## Gateway setup (once, for PC calling/SMS)

1. Confirm with the telco that the chosen business SIM plan allows gateway / PBX use.
2. Register the business SIM, then install it in the gateway box.
3. Configure a local bridge service or PBX that can:
   - send SMS
   - start outbound calls
   - POST inbound SMS to `https://voip-system.vercel.app/api/gateway/messages/incoming`
   - POST call outcomes to `https://voip-system.vercel.app/api/gateway/calls/events`
4. Run `supabase/messages.sql` in the Supabase SQL editor.
5. On Vercel, add env vars from `.env.example` (`GATEWAY_*`, `SUPABASE_SERVICE_ROLE_KEY`), then **redeploy**.

Until those vars are set, Contact/Inbox show a setup banner. **Call on phone** still works.

Calls and SMS are **PH numbers only** (`+63`).

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Schema is on Supabase project `dphjtppwsdjbbrmaofje`. Run `messages.sql` if Inbox is empty/errors.
3. Create staff users in Auth; disable public sign-up.
4. `npm install` then `npm run dev`.

## Daily workflow

1. Sign in on the PC.
2. **Contact** — dial and request a call through the office gateway, or **Inbox** — send messages and **Call**.
3. Use **Queue** for parcels that still need a logged outcome.
