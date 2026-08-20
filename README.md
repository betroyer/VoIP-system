# Customer Contact System

Private staff dashboard for contacting parcel customers in the Philippines. Follows **Customer Contact System Plan v3**: no Twilio, no GSM gateway, no auto-dialer.

Staff see who to contact, **call or text from the business phone** (SIM **09943282611** + Unli All-Net), then log the outcome here.

## Stack

- Next.js on Vercel
- Supabase (Postgres, Auth, Storage)
- Local PH business SIM (TNT / Smart / Globe Unli promo)

## Daily workflow

1. Sign in.
2. Open **Queue**.
3. **Call customer** or **Message customer** — uses the device phone/SMS app on the business phone.
4. Log answered / sent / no answer, etc.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Schema is on Supabase project `dphjtppwsdjbbrmaofje`.
3. Create staff accounts in Auth; disable public sign-up.
4. `npm install` then `npm run dev`.
