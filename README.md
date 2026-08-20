# Customer Contact System

Private staff dashboard to **call and message Philippine customers from the website**. One shared business number (`09943282611`). Up to ~10 staff.

## Call from a PC (in the browser)

**Call from this PC** uses Twilio Voice (microphone + WebRTC). It dials the customer’s PH number. Caller ID is set to `+639943282611` when that number is **verified** in Twilio.

A PC browser **cannot** send the call through your Unli SIM. The audio goes over the internet (Twilio). Unli minutes on the physical phone do not apply. If Twilio cannot verify your mobile as caller ID, customers may see a Twilio number instead.

### Twilio setup (once)

1. Create a [Twilio](https://www.twilio.com) account and add billing (Voice to PH is billed per minute).
2. **Phone Numbers → Verified Caller IDs** — add `+639943282611` (or buy a PH Twilio number if verification is blocked).
3. **Account → API keys & tokens** — create an API key; copy SID + secret.
4. **Voice → TwiML Apps → Create**
   - Voice Request URL: `https://voip-system.vercel.app/api/voice/twiml` (HTTP POST)
   - Copy the TwiML App SID
5. On Vercel, add env vars from `.env.example` (`TWILIO_*`), then **redeploy**.

Until those vars are set, the dashboard shows **Call from PC (setup needed)** and **Call on phone** still works.

Calls are **PH numbers only** (`+63`).

## Message

**Message customer** sends SMS via Twilio if `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` are set; otherwise it opens the device SMS app.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Schema is already on Supabase project `dphjtppwsdjbbrmaofje`.
3. Create staff users in Auth; disable public sign-up.
4. `npm install` then `npm run dev`. Allow microphone in the browser.

## Daily workflow

1. Sign in on the PC.
2. Open **Queue** → **Call from this PC** (allow mic) or **Message customer**.
3. Hang up in the dashboard when done. The call is logged automatically.
