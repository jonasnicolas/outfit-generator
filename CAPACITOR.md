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
