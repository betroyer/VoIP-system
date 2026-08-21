# Customer Contact — Android (Flutter)

**Primary product.** Staff app: **Dial**, **Inbox**, **Contacts**, and **Orders** on an Android phone with the business SIM.

Calls and SMS use the SIM in the device — not the website.

## Requirements

- Flutter 3.x / Dart 3.x
- Android phone with business SIM (09171392170)
- Supabase staff login (same project as the web logbook)

## Setup

```bash
cd mobile
cp .env.example .env
# Edit .env with SUPABASE_URL and SUPABASE_ANON_KEY
flutter pub get
```

## Run on a connected Android device

```bash
flutter devices
flutter run
```

## Screens

| Screen | What it does |
|--------|----------------|
| **Dial** | Keypad → **Call** (SIM + record) or **Message** |
| **Inbox** | SMS threads; open thread to send SMS / call |
| **History** | Play call recordings saved on this phone |
| **Contacts** | Customer list → message or call |
| **Orders** | Parcels → open thread |
| Call recording | Consent → foreground mic → History (+ optional cloud) |

## Install from GitHub (release APK)

1. Open **/releases** on the deployed site, or [GitHub Releases](https://github.com/betroyer/VoIP-system/releases).
2. Download `customer-contact-*.apk`, allow unknown installs, install, sign in.

Local build:

```bash
cd mobile
bash scripts/patch_telephony.sh
flutter build apk --release
```

## Permissions

SMS and phone on first use. Recording permission reserved for Phase 5.

## RA 4200

Before each recorded call the app shows a consent dialog. Staff must say the disclosure on the line (see `AppConfig.disclosureScript`). Run `supabase/call_recordings.sql` once so metadata can be saved.

**Note:** Android does not allow third-party apps to capture the full cellular voice stream. Use **speakerphone** so more of the customer is heard on the mic recording. Tap **Stop & save** when the call ends if auto-detect misses it.
