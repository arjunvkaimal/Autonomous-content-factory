export async function runGemini(sourceText) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
Extract structured data from the input.

Return ONLY raw JSON. Do NOT use markdown. Do NOT wrap in backticks.

Format:
{
  "features": [],
  "specs": {},
  "audience": "",
  "valueProposition": ""
}

Rules:
- features should be short but meaningful
- audience should be concise
- valueProposition should be a full sentence

Text:
${sourceText}
                `,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await res.json();

  const raw =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    features: parsed.features || [],
    specs: parsed.specs || {},
    audience: parsed.audience || "general users",
    valueProposition:
      parsed.valueProposition || "General utility",
  };
}