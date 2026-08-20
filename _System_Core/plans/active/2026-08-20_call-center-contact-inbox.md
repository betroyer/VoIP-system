# Active plan — Call center Contact + Inbox

**Spec:** [[../../specs/2026-08-20_call-center-contact-inbox]]

## Approach

1. Nav: **Contact** (dial pad + WebRTC call), **Inbox** (SMS threads + call).
2. Provider: local SIM gateway / PBX bridge (PC has no SIM). PH numbers only.
3. `messages` table for threads; gateway inbound webhook.
4. Parcel Queue stays; Call on phone remains as fallback.

## Done when

- `/contact` and `/inbox` exist
- Gateway bridge routes exist
- Setup banner when keys missing
- Docs + memory bank updated
