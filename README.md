# Customer Contact System

Private 2-user dashboard for calling and texting parcel customers in the Philippines. Staff place calls and SMS on a business phone, then log outcomes here. No Twilio, GSM gateway, or auto-dialer.

## Stack

- Next.js on Vercel
- Supabase (Postgres, Auth, Storage)
- Manual TNT / Smart / Globe phone + Unli All-Net promo

## Local setup

1. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key.
2. In a new Supabase project, run `supabase/schema.sql`.
3. Authentication → Settings: turn **off** public sign-up.
4. Authentication → Users: create exactly two staff accounts (owner + coworker).
5. Run `npm install` then `npm run dev`.

## Daily workflow

1. Sign in.
2. Open **Queue** for orders that still need contact.
3. Call or text the customer from the business phone.
4. If recording, say: “This call may be recorded for quality purposes.”
5. Log the outcome. Uncheck **Still needs contact** when follow-up is done.
