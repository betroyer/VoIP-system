# Product Theory — Customer Contact System

> What this system *should be*. Technical how-to: [[000_System_Architecture]].

## Vision

A web dashboard where staff contact local Philippine customers about parcel orders — **call and message from the system** — using one shared business number (**09943282611**). Up to **10 staff** share the queue and log outcomes so nobody double-calls the same customer.

## Who uses it

| User | Jobs |
|------|------|
| **Staff (up to 10)** | Open queue, call/message customer, log outcome |
| **Customer** | Receives call/SMS on their mobile — they never log in |

## Domain principles

1. **Contact from the dashboard** — Call customer and Message customer on each order.
2. **One business line** — All staff share 09943282611 (Unli All-Net on that SIM).
3. **Team visibility** — Every attempt logged in `contact_logs`.
4. **Private by login** — Supabase Auth; no public sign-up.
5. **Consent if recording** — RA 4200 disclosure on calls.

## How call/SMS works

| Action | Behavior |
|--------|----------|
| **Call from this PC** | Twilio Voice in the browser. Staff headset/mic. Dials PH `+63` numbers only. Caller ID = verified `09943282611` when Twilio accepts it. **Not** the Unli SIM carrying the call. |
| **Call on phone** | Opens the phone dialer (use the business phone for Unli). |
| **Message customer** | Compose in the app. Twilio SMS if configured; else device SMS app. |

## Non-goals (unless spec says otherwise)

- Customer self-serve portal
- Public registration
- International destinations (outside PH)

## Feature specs

- [[specs/TEMPLATE_Feature_Spec]]
- [[specs/2026-08-20_customer-contact-system]]
