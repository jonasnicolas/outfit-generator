// Vercel serverless function — a server-side proxy to OpenRouter so the API
// key never reaches the browser. Set OPENROUTER_API_KEY (NOT VITE_-prefixed)
// in your Vercel project's Environment Variables; it stays on the server.
//
// The browser POSTs { prompt: string, images: string[] } (images are base64,
// with or without a data: prefix). We respond with { imageUrl } or { error }.

const MODEL = "google/gemini-2.5-flash-image";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server is missing OPENROUTER_API_KEY." });
    return;
  }

  const { prompt, images } = (req.body || {}) as {
    prompt?: string;
    images?: string[];
  };
  if (!prompt || !Array.isArray(images) || images.length === 0) {
    res
      .status(400)
      .json({ error: "Expected { prompt: string, images: string[] }." });
    return;
  }

  const content: any[] = [{ type: "text", text: prompt }];
  for (const b64 of images) {
    content.push({
      type: "image_url",
      image_url: {
        url: b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`,
      },
    });
  }

  let orResp: Response;
  try {
    orResp = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers?.origin || "https://outfit98.app",
        "X-Title": "Outfit98",
      },
      body: JSON.stringify({
        model: MODEL,
        modalities: ["image", "text"],
        messages: [{ role: "user", content }],
      }),
    });
  } catch (err: any) {
    res
      .status(502)
      .json({ error: `Failed to reach OpenRouter: ${err?.message || err}` });
    return;
  }

  if (!orResp.ok) {
    const text = await orResp.text().catch(() => "");
    // Forward the upstream status (e.g. 429) so the client can react/retry.
    res
      .status(orResp.status)
      .json({ error: `OpenRouter error (${orResp.status}). ${text}` });
    return;
  }

  const data = await orResp.json();
  const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) {
    res.status(502).json({ error: "OpenRouter did not return an image." });
    return;
  }

  res.status(200).json({ imageUrl: url });
}
