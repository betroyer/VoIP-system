# Customer Contact System

**Primary product:** Android Flutter app (`mobile/`) — dial, call, and SMS customers using the **SIM inside the phone**, synced to Supabase.

The website is only for **installing the APK**, optional queue/logbook, and staff admin — not for placing calls or sending SMS.

## Install the staff app

1. Open **[/releases](https://voip-system.vercel.app/releases)** on the business Android phone  
   (or [GitHub Releases](https://github.com/betroyer/VoIP-system/releases)).
2. Download `customer-contact-*.apk`, allow install from browser, open the file.
3. Sign in with staff Supabase credentials. Grant SMS and phone permissions.
4. Use **Dial** to call or message any PH number; **Inbox** / **Contacts** / **Orders** for follow-ups.

See `mobile/README.md`.

## Web (optional back office)

- **Queue / Orders / Customers / Logs** — parcel follow-up and outcome logging after you contact from the phone.
- **Install app** — `/releases`

Web **Contact** and **Inbox** redirect to the install page (removed as a call center).

## Local web setup (logbook only)

1. Copy `.env.example` to `.env.local` (Supabase URL + anon key).
2. `npm install` then `npm run dev`.
3. Create staff users in Supabase Auth; disable public sign-up.

## Daily workflow

1. Install / open the Android app on the phone with SIM **09171392170**.
2. **Dial** or open a thread → **Call** / **Send** (goes through that SIM).
3. Optionally log outcomes on the web Queue.
