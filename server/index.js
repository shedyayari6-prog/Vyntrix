import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MODEL = process.env.CEREBRAS_MODEL || "gpt-oss-120b";

// Bigger limit so a full generated website can be sent back for revisions
app.use(express.json({ limit: "600kb" }));

const ai = process.env.CEREBRAS_API_KEY
  ? new OpenAI({
      apiKey: process.env.CEREBRAS_API_KEY,
      baseURL: "https://api.cerebras.ai/v1",
      maxRetries: 2,      // automatically retries short network / server hiccups
      timeout: 120_000,   // 2 minutes
    })
  : null;

/* ------------------------------------------------------------------ */
/* The prompt: this is what makes the websites good                    */
/* ------------------------------------------------------------------ */
const BASE_PROMPT = `You are VYNTRIX AI Builder, a senior web designer and front-end engineer.
You turn a short idea into a complete, polished, production-quality website.

OUTPUT RULES (strict)
- Reply with ONE complete HTML document and nothing else. No markdown, no code fences, no explanations.
- Start with <!DOCTYPE html> and end with </html>.
- Everything lives in that single file: CSS in one <style> tag, JavaScript in one <script> tag at the end of <body>.
- No external JavaScript libraries or frameworks. The only allowed external resource is Google Fonts via <link>.
- No external image URLs and no placeholder image services. Create visuals with CSS gradients, inline SVG, shapes, or emoji.
- Never include API keys, secrets or server credentials. Never claim the site is deployed or has a real backend.

STRUCTURE (the visual editor depends on this)
- Put the page layout directly inside <body> as top-level blocks: <header>, then several <section> elements, then <footer>.
- Give each section its own id and a clear purpose so users can reorder them.
- Use semantic HTML: one <h1>, logical heading order, <nav>, <button>, <a>, <ul>, <article>.

DESIGN QUALITY
- Pick a distinct visual direction that fits the idea: a deliberate palette (3-5 colors), one or two Google Fonts, strong type hierarchy, generous spacing.
- Define colors, radius and spacing as CSS variables on :root.
- Avoid generic template looks: use layered gradients, subtle borders, soft shadows, big confident headlines, balanced whitespace.
- Include an engaging hero with a clear call to action, then sections that fit the idea (features, products or projects, testimonials, pricing, FAQ, contact, and so on).
- Write real, specific, convincing copy for this business. Never use lorem ipsum or "Your text here".
- Fully responsive and mobile-first: flexbox/grid and fluid type with clamp(). It must look great from 360px to 1440px wide.
- The mobile navigation must work (a menu button that toggles the links).
- Add tasteful interaction: hover and focus states, smooth scrolling, scroll-reveal with IntersectionObserver, and working tabs, accordions or carousels where they fit.
- Forms must be usable (labels, validation attributes) and show a friendly success message in JavaScript without sending data anywhere.
- Accessible: good contrast, alt text or aria-labels, visible focus, respect prefers-reduced-motion.`;

const REVISION_PROMPT = `
EDITING AN EXISTING WEBSITE
- The user supplies the current HTML and a change request. Apply the change and return the COMPLETE updated document, not a diff or a summary.
- Keep everything the user did not ask to change exactly as it is, including their text edits, colors, section order and working features.
- Do not rebuild from scratch when a targeted edit is enough. Do not shorten the document.`;

const NEW_SITE_PROMPT = `
NEW WEBSITE
- Generate a complete website from the user's description. Make confident design choices where the description is vague.`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function extractHtml(text) {
  let t = (text || "").trim();
  const fence = t.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.search(/<!doctype html|<html/i);
  if (start > 0) t = t.slice(start);
  const end = t.toLowerCase().lastIndexOf("</html>");
  if (end !== -1) t = t.slice(0, end + 7);
  return /<html|<body/i.test(t) ? t : "";
}

// Turns any Cerebras / network failure into a code the frontend understands.
// The frontend shows a friendly "under construction" page for each code.
function classifyError(error) {
  const status = error?.status;
  const message = String(error?.message || "");
  const errCode = String(error?.code || error?.error?.code || "");

  if (status === 402 || /insufficient|credit|billing|quota exhausted/i.test(errCode + " " + message)) {
    return { http: 503, code: "no_credit" };
  }
  if (status === 429) {
    // Daily/token quotas read like credits running out; short-term limits are just "busy"
    return /quota|daily|per day|token.*limit/i.test(errCode + " " + message)
      ? { http: 503, code: "no_credit" }
      : { http: 503, code: "busy" };
  }
  if (status === 401 || status === 403 || status === 404) return { http: 503, code: "config" };
  if (error?.name === "APIConnectionTimeoutError") return { http: 504, code: "timeout" };
  if (error?.name === "APIConnectionError") return { http: 503, code: "offline" };
  if (status === 503) return { http: 503, code: "busy" };
  return { http: 502, code: "unknown" };
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(ai), provider: "Cerebras", model: MODEL });
});

app.post("/api/generate", async (req, res) => {
  const prompt = req.body?.prompt;
  const existingHtml = req.body?.existingHtml;

  // Bad input stays a normal 400 (shown inline, not on the construction page)
  if (typeof prompt !== "string" || prompt.trim().length < 10) {
    return res.status(400).json({ error: "Please enter at least 10 characters.", code: "invalid" });
  }
  if (prompt.length > 5000) {
    return res.status(400).json({ error: "Your prompt must be shorter than 5,000 characters.", code: "invalid" });
  }
  if (existingHtml !== undefined && (typeof existingHtml !== "string" || existingHtml.length > 90000)) {
    return res.status(400).json({
      error: "The current website is too large to revise in one request. Try a smaller change or start a new site.",
      code: "invalid",
    });
  }

  if (!ai) {
    console.error("CEREBRAS_API_KEY is missing from the .env file.");
    return res.status(503).json({ error: "Not configured.", code: "config" });
  }

  const isRevision = typeof existingHtml === "string" && existingHtml.trim().length > 0;

  const userContent = isRevision
    ? `CHANGE REQUEST:\n${prompt.trim()}\n\nCURRENT WEBSITE HTML:\n${existingHtml}\n\nReturn the complete updated HTML document.`
    : `Build this website:\n\n${prompt.trim()}`;

  try {
    const request = {
      model: MODEL,
      messages: [
        { role: "system", content: BASE_PROMPT + (isRevision ? REVISION_PROMPT : NEW_SITE_PROMPT) },
        { role: "user", content: userContent },
      ],
      temperature: isRevision ? 0.4 : 0.8,
      // gpt-oss "thinks" first, and thinking uses part of this budget, so keep it generous
      max_completion_tokens: 16000,
    };

    // Less thinking = more of the budget goes to the actual website (and it's faster)
    if (/gpt-oss/i.test(MODEL)) {
      request.reasoning_effort = process.env.CEREBRAS_REASONING || "low";
    }

    const response = await ai.chat.completions.create(request);

    const choice = response.choices?.[0];
    const html = extractHtml(choice?.message?.content);

    // Ran out of tokens halfway through the page
    if (choice?.finish_reason === "length" && !/<\/html>/i.test(html)) {
      console.error("Website was cut off (hit the token limit).");
      return res.status(504).json({ error: "Website too large.", code: "timeout" });
    }

    if (!html) {
      console.error("AI did not return an HTML page. finish_reason:", choice?.finish_reason);
      return res.status(502).json({ error: "Empty result.", code: "empty" });
    }

    res.json({ html });
  } catch (error) {
    console.error("Cerebras generation error:", error?.status || "", error?.code || "", error?.message);
    const { http, code } = classifyError(error);
    res.status(http).json({ error: "Generation failed.", code });
  }
});

app.listen(PORT, () => {
  console.log(`VYNTRIX AI backend running at http://localhost:${PORT}`);
});