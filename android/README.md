# CampusHub Android

The Android app is a thin, native wrapper around the production CampusHub web app
(https://campushub-pine.vercel.app), built with Capacitor. The web app remains the
single source of truth — shipping a fix to the site updates the app (restart the app
to pick it up; the wrapper is just a hardened WebView).

## What's configured

- App name: **CampusHub**, id: `com.campushub.app`
- Launch splash: warm paper background (`#f7f6f2`)
- Display cutouts / full insets handled; dark status bar text
- Mixed content blocked, plain-text traffic disabled (HTTPS only)

## Prerequisites

- JDK 17 (`brew install --cask temurin@17` on macOS)
- Android SDK via Android Studio (accept licenses: `sdkmanager --licenses`)

## Debug build

```bash
npm run android:sync             # cap sync android
npm run android:open             # open in Android Studio, press Run
# or pure CLI:
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Release build (signed)

1. Generate an upload keystore (keep it private; **never commit it**):

```bash
keytool -genkeypair -v -keystore campushub-upload.keystore \
  -alias campushub -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/keystore.properties` (already gitignored) with:

```properties
storeFile=/absolute/path/to/campushub-upload.keystore
storePassword=YOUR_PASSWORD
keyAlias=campushub
keyPassword=YOUR_PASSWORD
```

3. Build:

```bash
npm run android:build            # sync + bundleRelease + assembleRelease
# APK:  android/app/build/outputs/apk/release/app-release.apk
# AAB:  android/app/build/outputs/bundle/release/app-release.aab  (Play Store)
```

4. Attach the APK to the GitHub Release (`gh release upload v1.0.0 app-release.apk`).

## Signing key safety

- `campushub-upload.keystore` and `keystore.properties` are gitignored.
- Back the keystore up securely (password manager + encrypted storage). Losing it
  means losing the ability to update the app under the same listing on Play.

## Deep links (optional, later)

To open campushub links inside the app, add an intent-filter for
`https://campushub-pine.vercel.app` and host a Digital Asset Links JSON at
`/.well-known/assetlinks.json`.
