import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.outfit98.app",
  appName: "Outfit98",
  // Web build output (used by `cap sync`). Not served at runtime while
  // `server.url` below is set — see note.
  webDir: "dist",
  backgroundColor: "#dce2f0",
  server: {
    // Hosted-URL route: the native shell loads the live site, so the
    // serverless /api/generate proxy and Supabase keep working and every
    // Vercel deploy updates the app instantly — no rebuild/resubmit.
    //
    // To ship a fully offline/bundled build instead, delete this `url`
    // line, run `npm run build`, then `npx cap sync`. (You'd then also need
    // the API to be reachable at an absolute URL.)
    url: "https://outfit-generator-xi.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
