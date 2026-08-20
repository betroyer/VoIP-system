# Customer Contact System

Private staff dashboard for a small **PH call center on a computer**: dial from **Contact**, text from **Inbox** (Messenger-style), plus a parcel **Queue**.

## Two ways to reach customers

| Mode | How it works |
|------|----------------|
| **From this PC** | Twilio Voice (microphone) + Twilio SMS. Unli on the SIM does **not** apply. |
| **From the business phone** | `tel:` / `sms:` on SIM **09171392170** + Unli All-Net (Plan v3). |

A PC has no SIM. Computer calling cannot use the Unli promo.

## Navigation

- **Contact** — dial pad, call, open inbox for that number
- **Inbox** — SMS threads; Call from the conversation
- **Queue / Orders / Customers / Logs** — parcel follow-up

## Twilio setup (once, for PC calling/SMS)

1. Create a [Twilio](https://www.twilio.com) account and add billing (Voice/SMS to PH is billed).
2. **Phone Numbers → Verified Caller IDs** — add `+639171392170`, or buy a Twilio number if verification is blocked.
3. **Account → API keys & tokens** — create an API key; copy SID + secret.
4. **Voice → TwiML Apps → Create**
   - Voice Request URL: `https://voip-system.vercel.app/api/voice/twiml` (HTTP POST)
   - Copy the TwiML App SID
5. **Messaging** webhook (same Twilio number): `https://voip-system.vercel.app/api/sms/incoming` (HTTP POST)
6. Run `supabase/messages.sql` in the Supabase SQL editor.
7. On Vercel, add env vars from `.env.example` (`TWILIO_*`, `SUPABASE_SERVICE_ROLE_KEY`), then **redeploy**.

Until those vars are set, Contact/Inbox show a setup banner. **Call on phone** still works.

Calls and SMS are **PH numbers only** (`+63`).

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Schema is on Supabase project `dphjtppwsdjbbrmaofje`. Run `messages.sql` if Inbox is empty/errors.
3. Create staff users in Auth; disable public sign-up.
4. `npm install` then `npm run dev`. Allow microphone in the browser.

## Daily workflow

1. Sign in on the PC.
2. **Contact** — dial and **Call**, or **Inbox** — send messages and **Call**.
3. Use **Queue** for parcels that still need a logged outcome.
