# Fragile Edges (Manual)

> Read before changing auth, git, or env. See also [[000_System_Architecture]].

## Two GitHub identities on this PC

Global git user is **diobrandedd**. This repo overrides locally:

- `user.name` = `betroyer`
- `user.email` = `delossantosbrent69@gmail.com`
- credential helper = `gh auth git-credential`

Do not run `git config --global` to switch accounts. Other projects must keep using diobrandedd.

## Home folder is also a git repo

`C:\Users\Admin` has its own `.git`. Always work inside `Documents/VoIP system` so commits do not land on the home repo.

## Two Supabase projects

| Project | Ref | Use |
|---------|-----|-----|
| Customer Contact (this) | `dphjtppwsdjbbrmaofje` | This dashboard |
| Brent / PYX | `jrmieezescbvvttnttdp` | Food site — do not reuse those keys here |

## Env files

- `.env*` is gitignored except `.env.example`
- Vercel CLI may append `VERCEL_OIDC_TOKEN` to `.env.local` — keep the two `NEXT_PUBLIC_SUPABASE_*` lines
- Anon key is public-by-design (browser). Never put **service_role** in Next.js client env

## Next.js 16 proxy, not middleware

Auth refresh lives in `proxy.ts` + `lib/supabase/proxy.ts`. Do not add a deprecated `middleware.ts`.

## `lib/auth.tsx` must stay `.tsx`

`StaffPage` returns JSX. A `.ts` extension fails the Turbopack parse.

## Server actions + `useActionState`

Form `action=` cannot return `{ error }`. Use `ActionForm` (`useActionState`) with `(prev, formData) => ActionState`.

## Disabled fields are not submitted

On order edit, `customer_id` is disabled. `updateOrder` must not require it from FormData.

## Call recording is optional and private

Bucket `call-recordings` is not public. Store the storage **path** in `contact_logs.recording_link`, then signed URLs when playing back.

## Gateway webhooks must skip login

`/api/gateway/messages/incoming` and `/api/gateway/calls/events` are allowlisted in `lib/supabase/proxy.ts`. If `GATEWAY_API_KEY` is set, the bridge must send the same `x-gateway-api-key` header.

## Service role is server-only

`SUPABASE_SERVICE_ROLE_KEY` is used only in `lib/supabase/admin.ts` for inbound SMS. Never prefix with `NEXT_PUBLIC_`.

## PC calling needs a bridge

The browser does not carry the call audio itself anymore. The dashboard sends a call request to the bridge; the real voice path must be handled by the PBX/SIP client/gateway setup on the office network.

## RA 4200

Recording a call in the Philippines generally needs consent. Staff should say: “This call may be recorded for quality purposes.” The dashboard reminder is not a substitute for saying it on the call.

## Vercel Git

Production was deployed with `vercel deploy --prod`. `git push` will not rebuild the site until the Vercel GitHub app is installed on `betroyer/VoIP-system`.
