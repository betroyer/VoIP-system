# Android Call Recorder (Shizuku companion)

Side project for **staff-owned Android phones** on the Unli SIM path. Records SIM calls after the user enables **Shizuku + Wireless Debugging**, then optionally uploads the `.m4a` into the existing Next.js dashboard.

This is **not** part of the Next.js Vercel app. Open this folder in Android Studio.

## What the five prompts map to

| Prompt | Code |
|--------|------|
| 1 Shizuku setup | `app/build.gradle.kts`, `shizuku/ShizukuManager.kt` |
| 2 ADB unlock | `shizuku/AdbPrivilegeHelper.kt` |
| 3 Accessibility + call state | `service/CallRecordingAccessibilityService.kt`, `res/xml/accessibility_service_config.xml` |
| 4 Two-way audio engine | `audio/CallAudioRecorder.kt` (`VOICE_CALL` → fallbacks) |
| 5 Pairing wizard UI | `ui/WizardActivity.kt`, `res/layout/activity_wizard.xml` |

## Hard limits (read before relying on this)

1. **`pm grant … CAPTURE_AUDIO_OUTPUT` often fails** on stock Android (“not a changeable permission type”). Without it, `AudioSource.VOICE_CALL` may be blocked or mic-only. Test per OEM (Samsung/Xiaomi vary).
2. **RA 4200 (PH):** say on every call — *“This call may be recorded for quality purposes.”*
3. **Own devices only.** Wireless Debugging + Shizuku is a deliberate developer unlock — do not use for covert recording of people who did not consent.
4. **Not Play Store friendly** (Accessibility + privileged capture patterns). Sideload for staff phones.
5. **Cheaper alternative that always hears both sides:** Twilio cloud recording on the PC path (paid per minute). This app exists to keep **Unli** economics when the OEM allows it.

## Staff setup (in-app guide)

On first launch the app opens **Activate both-sides recording** (9 steps). You can reopen it anytime with **Open step-by-step setup guide**.

Home screen also shows an activation checklist + numbered actions (Grant → Unlock → Accessibility).

## Release APK

Built artifact (sideload):

`android-call-recorder/releases/VoIP-Call-Recorder-1.0.0.apk`

Also produced by:

```bash
cd android-call-recorder
# Use JDK 17 (AGP 8.7 does not run on Android Studio JBR 25)
export JAVA_HOME="$HOME/.jdks/temurin-17"   # Windows: C:\Users\Admin\.jdks\temurin-17
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`  
Version: **1.0.0** (versionCode 2). Signed with the debug keystore for internal staff use — not for Play Store.

Install on phone: copy the APK → open → Allow unknown apps → Install. Then open the app (setup guide starts automatically).

## Build

```bash
cd android-call-recorder
# Android Studio: Open this folder, sync Gradle, Run on device (API 29+).
# Or CLI: ./gradlew assembleRelease
```

Requires Android SDK. `local.properties` with `sdk.dir` is machine-local (do not commit secrets; sdk path only).

## Upload into the web dashboard

After a call, copy the `.m4a` from the recordings folder into the Contact log **Attach call recording** field (existing Next.js flow). Automatic sync can be a later sprint.
