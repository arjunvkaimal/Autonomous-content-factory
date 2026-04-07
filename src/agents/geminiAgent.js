export async function runGemini(sourceText) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("Missing Gemini API key");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let res;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a strict JSON extraction engine. Extract product data from the marketing brief below.

Return ONLY valid JSON. No markdown. No explanation. No code fences. Just raw JSON.

Required format:
{
  "features": ["string", "string", "string", "string", "string"],
  "specs": { "key": "value" },
  "audience": "string",
  "valueProposition": "string"
}

Rules:
- features: Extract 3-5 real product capabilities as short clear phrases (e.g. "Instant settlement within 90 seconds"). Skip document titles, internal notes, or section headings.
- specs: Extract only numeric/measurable values (e.g. "Transaction Fee": "1.4%", "Settlement Time": "90 seconds", "Supported Currencies": "14").
- audience: Primary target customer in one sentence.
- valueProposition: The single core advantage of this product in one sentence.

DO NOT include any of these as features or values:
- "PRODUCT LAUNCH BRIEF"
- "Internal Document"
- Section headers like "OVERVIEW", "KNOWN AMBIGUITIES", "LAUNCH ASSETS"

TEXT:
${sourceText}`,
                },
              ],
            },
          ],
        }),
      }
    );
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Gemini request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  // Check HTTP status first
  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini HTTP Error:", res.status, errText);
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();

  // Surface any API-level errors
  if (data.error) {
    console.error("Gemini API error body:", data.error);
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  console.log("RAW GEMINI:", raw);

  if (!raw) {
    throw new Error("Empty response from Gemini");
  }

  // Strip markdown code fences if present (```json ... ```)
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  // Extract the JSON object
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("No JSON block found in:", raw);
    throw new Error("No JSON found in Gemini response");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON PARSE FAILED:", jsonMatch[0]);
    throw new Error("Invalid JSON structure from Gemini");
  }

  const clean = (t) => (t ? t.trim().replace(/[.,]+$/, "") : "");

  const NOISE = [
    "product launch brief",
    "internal document",
    "marketing use only",
    "known ambiguities",
    "launch assets",
    "overview",
  ];

  const isNoise = (str) =>
    NOISE.some((n) => str.toLowerCase().includes(n));

  const validFeatures = (parsed.features || [])
    .map((f) => clean(f))
    .filter((f) => f.length > 10 && !isNoise(f))
    .slice(0, 5);

  const cleanedAudience = clean(parsed.audience);
  const cleanedValue = clean(parsed.valueProposition);

  return {
    features: validFeatures,
    specs: parsed.specs || {},
    audience: !isNoise(cleanedAudience) ? cleanedAudience : "Unknown Audience",
    valueProposition: !isNoise(cleanedValue) ? cleanedValue : "Unknown Value Proposition",
  };
}