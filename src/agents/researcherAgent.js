import useStore from "../store/pipelineStore";
import { runGemini } from "./geminiAgent";

export async function runResearcher() {
  const { sourceText, setFactSheet, addLog, setStepStatus } =
    useStore.getState();

  setStepStatus("researcher", "running");
  addLog("Researcher", "Starting document analysis...", "info");

  // ── Step 1: Smart section-based parser (always runs) ────────────────────
  addLog("Researcher", "Running local section parser...", "info");
  const localData = parseDocument(sourceText);

  addLog("Researcher", `Extracted ${localData.features.length} features`, "data");
  addLog("Researcher", `Audience: ${localData.audience.substring(0, 60)}...`, "data");
  addLog("Researcher", `Specs found: ${Object.keys(localData.specs).join(", ") || "none"}`, "data");

  // ── Step 2: Try Gemini to enrich ────────────────────────────────────────
  addLog("Researcher", "Attempting Gemini AI enrichment...", "info");
  try {
    const aiData = await runGemini(sourceText);
    addLog("Researcher", "Gemini responded successfully", "success");

    const features =
      aiData.features.length >= localData.features.length
        ? aiData.features
        : localData.features;

    const audience =
      aiData.audience && !aiData.audience.toLowerCase().includes("general")
        ? aiData.audience
        : localData.audience;

    const valueProposition =
      aiData.valueProposition &&
        !aiData.valueProposition.toLowerCase().includes("general utility")
        ? aiData.valueProposition
        : localData.valueProposition;

    addLog("Researcher", `Value prop: "${valueProposition.substring(0, 70)}..."`, "data");

    setFactSheet({
      features,
      specs: Object.keys(aiData.specs).length ? aiData.specs : localData.specs,
      audience,
      valueProposition,
      warnings: [],
    });

    addLog("Researcher", "Fact sheet built from Gemini + local data", "success");
    setStepStatus("researcher", "done");
    return;
  } catch (err) {
    addLog("Researcher", `Gemini unavailable: ${err.message}`, "warn");
    addLog("Researcher", "Falling back to local parser result", "warn");
  }

  // ── Step 3: Use local parse directly ────────────────────────────────────
  addLog("Researcher", `Value prop: "${localData.valueProposition.substring(0, 70)}..."`, "data");
  setFactSheet({ ...localData, warnings: ["Using local parser (Gemini unavailable)"] });
  addLog("Researcher", "Fact sheet ready (local parser)", "success");
  setStepStatus("researcher", "done");
}

// ════════════════════════════════════════════════════════════════════════════
// Smart section-based document parser
// ════════════════════════════════════════════════════════════════════════════
function parseDocument(text) {
  const clean = (t) => (t ? t.trim().replace(/[.,]+$/, "") : "");

  function extractSection(sectionText, ...names) {
    for (const name of names) {
      const regex = new RegExp(
        `(?:^|\\n)${name}[^\\n]*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z /\\-]{2,}[A-Z]\\s*(?:\\n|$)|$)`,
        "i"
      );
      const m = sectionText.match(regex);
      if (m && m[1].trim()) return m[1].trim();
    }
    return "";
  }

  function extractBullets(sectionText) {
    return sectionText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^[-•]\s/.test(l))
      .map((l) => l.replace(/^[-•]\s*/, "").trim());
  }

  const featuresSection = extractSection(text, "KEY FEATURES", "FEATURES");
  const features = extractBullets(featuresSection)
    .map((f) => {
      const colonIdx = f.indexOf(":");
      return colonIdx > 0 ? clean(f.substring(0, colonIdx)) : clean(f);
    })
    .filter((f) => f.length > 3)
    .slice(0, 5);

  const pricingSection = extractSection(text, "PRICING");
  const specs = {};

  const feeMatch =
    pricingSection.match(/([\d.]+)%\s*(?:per|flat|transaction)/i) ||
    text.match(/([\d.]+)%\s*(?:per|flat|transaction fee)/i);
  if (feeMatch) specs["Transaction Fee"] = feeMatch[1] + "%";

  const currMatch = text.match(/(\d+)\s*currencies/i);
  if (currMatch) specs["Supported Currencies"] = currMatch[1];

  const settlementMatch = text.match(
    /(\d+)\s*seconds.*?settlement|settlement.*?(\d+)\s*seconds/i
  );
  if (settlementMatch)
    specs["Settlement Time"] = (settlementMatch[1] || settlementMatch[2]) + " seconds";

  const fraudMatch = text.match(/([\d]+)%.*?fraud|fraud.*?([\d]+)%/i);
  if (fraudMatch)
    specs["Fraud Reduction"] = (fraudMatch[1] || fraudMatch[2]) + "%";

  const audienceSection = extractSection(text, "TARGET AUDIENCE", "AUDIENCE");
  const primaryMatch = audienceSection.match(/Primary[:.]?\s*(.+)/i);
  const audience = primaryMatch
    ? clean(primaryMatch[1].split("\n")[0])
    : "Unknown Audience";

  const valueSection = extractSection(text, "VALUE PROPOSITION", "VALUE PROP");
  const valueProposition =
    clean(valueSection.split("\n")[0]) || "Unknown Value Proposition";

  return { features, specs, audience, valueProposition };
}