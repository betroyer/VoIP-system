# Customer Contact — Android (Flutter)

Plan v7 staff app: **Inbox**, **Contacts**, and **Orders** on an Android phone with the business SIM.

## Requirements

- Flutter 3.x / Dart 3.x
- Android phone with business SIM (09171392170)
- Supabase staff login (same project as the web dashboard)

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

Windows desktop build is **not** the target — SMS and calls only work on Android hardware.

## Install from GitHub (release APK)

1. Open the install page on your phone: **`/releases`** on the deployed site, or [GitHub Releases](https://github.com/betroyer/VoIP-system/releases).
2. Download the latest `customer-contact-*.apk`.
3. Allow installs from your browser if Android prompts you.
4. Open the file and install. Sign in with staff credentials.

To build locally:

```bash
cd mobile
bash scripts/patch_telephony.sh   # fixes discontinued telephony plugin for AGP 8+
flutter build apk --release
# APK: build/app/outputs/flutter-apk/app-release.apk
```

Tag `mobile-v1.0.0` (etc.) on GitHub to trigger `.github/workflows/android-release.yml` and attach the APK to a release. Set repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` for CI builds.

## Features (current)

| Screen | Status |
|--------|--------|
| Login | Supabase Auth |
| Inbox | Thread list + send SMS via SIM + call button |
| Contacts | List + message/call |
| Orders | Parcel list → open thread |
| Call recording | Stub — test on target phone model (Phase 5) |

## Permissions

The app requests SMS and phone permissions on first use. Recording permission is declared for Phase 5.

## RA 4200

Before recording calls, play the consent notice at call start. See `AppConfig.disclosureScript`.

## Legacy

The Next.js dashboard and `gateway-bridge/` are **not** the primary product under Plan v7.
