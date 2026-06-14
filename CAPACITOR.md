# Outfit98 — Native apps (Capacitor)

The iOS and Android apps are thin native shells around the live web app, built
with [Capacitor](https://capacitorjs.com/). The shell loads the deployed site
(`https://outfit-generator-xi.vercel.app`) in a full-screen WebView, so:

- the `/api/generate` proxy and Supabase keep working exactly as on the web,
- the Gemini key stays server-side (never shipped in the app binary),
- **every Vercel deploy updates the app instantly** — no rebuild or resubmit
  needed for web changes.

Config lives in [`capacitor.config.ts`](./capacitor.config.ts).

## One-time setup

```bash
npm install
```

The `ios/` and `android/` native projects are already committed. You only need
to regenerate them (`npx cap add ios|android`) if you delete them.

## Build & run

iOS requires a **Mac with Xcode**; Android requires **Android Studio**.

```bash
npm run cap:sync      # build web assets + copy config into native projects
npm run cap:ios       # open the project in Xcode      -> Run
npm run cap:android   # open the project in Android Studio -> Run
```

In Xcode: select your Team under **Signing & Capabilities**, pick a device/
simulator, press Run. In Android Studio: press Run, or **Build > Generate
Signed Bundle/APK** for a release `.aab`.

## App icon & splash

Source art is `assets/icon.png` (1024×1024) and `assets/splash.png`
(2732×2732), both rendered from `public/wardrobe.svg`. To regenerate every
native size after changing them:

```bash
npm run cap:assets
```

## Bundled (offline) build instead of hosted URL

The app currently loads the live site. To ship a self-contained build that
bundles the web assets, remove the `server.url` line in `capacitor.config.ts`,
then `npm run cap:sync`. Note the API must then be reachable at an absolute
URL (the app would no longer share an origin with `/api/generate`).

## Updating

- **Web/content change:** just deploy to Vercel — live apps pick it up.
- **Native change** (icon, config, Capacitor/plugin upgrade): `npm run cap:sync`,
  then rebuild in Xcode / Android Studio and resubmit.

## CI — Android builds on GitHub Actions

[`.github/workflows/android.yml`](./.github/workflows/android.yml) builds the
Android app on every push:

- Always produces an installable **debug APK** (artifact `outfit98-debug-apk`),
  no secrets required.
- If release-keystore secrets are configured, also produces a **signed `.aab`**
  (artifact `outfit98-release-aab`) ready for the Play Store.

To enable the signed `.aab`, create a keystore and add four repo secrets
(**Settings → Secrets and variables → Actions**):

```bash
keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias outfit98
base64 -w0 release.jks    # macOS: base64 -i release.jks
```

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | base64 output above |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `outfit98` (or your alias) |
| `ANDROID_KEY_PASSWORD` | key password |

Download builds from the run's **Artifacts** section. iOS isn't built in CI
(it needs macOS + Xcode signing); build it locally per the steps above.

## CD — auto-deploy to the Play Store (Fastlane)

On pushes to `main`, the workflow's `deploy` job uploads the signed `.aab` to
the Play Store **internal testing** track using
[Fastlane](https://fastlane.tools/) (`fastlane/Fastfile`, `Gemfile`). The
version code is set automatically from the CI run number, so each upload is
unique and increasing.

This job is **inert until you configure it** — it only runs when both the
keystore secrets (above) and a Play service-account secret are present, so CI
stays green in the meantime.

One-time setup:

1. **Create the app in the Play Console** and upload one `.aab` **manually**
   to the internal track. Google requires the first release by hand; API
   uploads only work afterward.
2. **Create a service account** with Play Developer API access
   (Play Console → *Users and permissions* → invite the service account, grant
   *Release to testing tracks*), download its JSON key.
3. Add the JSON (whole file contents) as the repo secret
   **`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`**.

After that, every push to `main` ships a new build to the internal track.
To run it by hand: `bundle exec fastlane internal`.
