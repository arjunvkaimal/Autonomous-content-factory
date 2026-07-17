import useStore from "../store/pipelineStore";
import { generateContent } from "./geminiAgent";

export async function runCopywriter() {
  // Issue 5: read tone from store instead of accepting it as a dead-code parameter
  const { factSheet, tone, setDrafts, addLog, setStepStatus } = useStore.getState();

  setStepStatus("copywriter", "running");
  addLog("Copywriter", "Starting content generation...", "info");

  const clean = (t) => (t ? t.trim().replace(/[.,]+$/, "") : "");

  const safeFactSheet = factSheet && typeof factSheet === "object" ? factSheet : {};
  const fullAudience = clean(safeFactSheet.audience) || "Unknown Audience";
  const valueProposition = clean(safeFactSheet.valueProposition) || "Unknown Value Proposition";

  function shortenAudience(str) {
    const cutPatterns = [/ who /i, / aged /i, / that /i, / looking to /i, / currently /i];
    let earliestIdx = Infinity;
    for (const pattern of cutPatterns) {
      const idx = str.search(pattern);
      if (idx > 10 && idx < earliestIdx) earliestIdx = idx;
    }
    if (earliestIdx < Infinity) return clean(str.substring(0, earliestIdx));
    if (str.length > 50) {
      const truncated = str.substring(0, 50);
      const lastSpace = truncated.lastIndexOf(" ");
      return clean(truncated.substring(0, lastSpace > 20 ? lastSpace : 50));
    }
    return str;
  }

  const audience = shortenAudience(fullAudience);
  addLog("Copywriter", `Audience label: "${audience}"`, "data");

  const featuresList = (Array.isArray(safeFactSheet.features) ? safeFactSheet.features : []).slice(0, 5);
  const featuresText = featuresList.map((f) => "- " + clean(f)).join("\n");
  const topFeature = clean(featuresList[0]) || "";
  const secondFeature = clean(featuresList[1]) || "";

  const specsData =
    safeFactSheet.specs && typeof safeFactSheet.specs === "object" && Object.keys(safeFactSheet.specs).length
      ? safeFactSheet.specs
      : {};
  const specsText = Object.entries(specsData)
    .map(([k, v]) => `• ${k}: ${clean(v)}`)
    .join("\n");

  const isInvalid = valueProposition.includes("Unknown Value Proposition") && featuresList.length === 0;

  if (isInvalid) {
    const blog = "Please provide a valid product brief with real features to generate a blog post.";
    const socialThread = ["Please provide a valid product brief to generate a social thread."];
    const emailTeaser = "Please provide a valid product brief to generate this email teaser.";
    setDrafts({ blog, socialThread, emailTeaser });
    setStepStatus("copywriter", "done");
    return;
  }

  try {
    addLog("Copywriter", "Calling Gemini API for all 3 content pieces...", "info");

    const effectiveTone = tone || "professional";

    const blogPrompt = `You are an expert copywriter. Write a blog post about the following product/topic. The tone should be ${effectiveTone}. Ensure you highlight the value proposition and key features naturally within the text. Fact Sheet: ${JSON.stringify(safeFactSheet)}`;

    const emailPrompt = `You are an expert marketer. Write a promotional email based on the following fact sheet. The tone should be ${effectiveTone}. Include an engaging subject line, a hook, a body explaining the core features, and a strong call to action. Fact Sheet: ${JSON.stringify(safeFactSheet)}`;

    const socialPrompt = `You are a social media manager. Create a cohesive thread of 3 social media posts based on the following fact sheet. The tone should be ${effectiveTone}. Each post must be under 280 characters. Return the response ONLY as a valid JSON array of strings, where each string is a single post. Do not include markdown formatting like \`\`\`json. Fact Sheet: ${JSON.stringify(safeFactSheet)}`;

    // Issue 2: use Promise.allSettled so one failure doesn't discard the others
    const [blogResult, emailResult, socialResult] = await Promise.allSettled([
      generateContent(blogPrompt),
      generateContent(emailPrompt),
      generateContent(socialPrompt),
    ]);

    // ── Blog ──────────────────────────────────────────────────────────────
    let blog;
    if (blogResult.status === "fulfilled") {
      blog = blogResult.value;
      addLog("Copywriter", "Blog post complete ✓", "success");
    } else {
      addLog("Copywriter", `Blog fallback (${blogResult.reason?.message})`, "warn");
      blog = `${valueProposition}.\n\nDesigned for ${audience}, this is a next-generation solution built to solve real problems at scale.\n\n${featuresText.length > 0 ? `Key Features:\n${featuresText}` : ""}\n\n${specsText.length > 0 ? `Specifications:\n${specsText}` : ""}\n\nEvery detail has been engineered to deliver reliability and real-world impact.`;
    }

    // ── Email ─────────────────────────────────────────────────────────────
    let emailTeaser;
    if (emailResult.status === "fulfilled") {
      emailTeaser = emailResult.value;
      addLog("Copywriter", "Email teaser complete ✓", "success");
    } else {
      addLog("Copywriter", `Email fallback (${emailResult.reason?.message})`, "warn");
      emailTeaser = `Subject: Something new for ${audience} — you'll want to see this.\n\nHi there,\n\n${valueProposition}.\n\nWe built this for people like you — ${audience} who want performance, simplicity, and results.\n\n${topFeature ? `Here's what sets it apart: ${topFeature}.` : ""}\n\nReady to see it in action? Hit reply or visit our site to learn more.\n\n— The Team`;
    }

    // ── Social thread ─────────────────────────────────────────────────────
    let socialThread;
    if (socialResult.status === "fulfilled") {
      try {
        // Issue 3: strip code fences then extract JSON array with regex (handles
        // preamble text like "Here's your thread:") — mirrors the object extraction
        // pattern in runGemini(): raw.match(/\{[\s\S]*\}/)
        let socialRaw = socialResult.value
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        const arrayMatch = socialRaw.match(/\[[\s\S]*\]/);
        if (!arrayMatch) throw new Error("No JSON array found in social response");
        socialThread = JSON.parse(arrayMatch[0]);
        addLog("Copywriter", `Social thread: ${socialThread.length} posts ✓`, "success");
      } catch (parseErr) {
        addLog("Copywriter", `Social parse fallback (${parseErr.message})`, "warn");
        socialThread = null; // fall through to template below
      }
    }
    if (!socialThread) {
      socialThread = [
        `🚀 Introducing the next big thing for ${audience}.`,
        `💡 ${valueProposition}.`,
        featuresText.length > 0 ? `✅ Standout feature: ${topFeature}.` : `✅ Engineered for real-world performance.`,
        secondFeature ? `⚡ Also: ${secondFeature}.` : `⚡ Thoughtfully designed for daily use.`,
        `🎯 Built for ${audience} who demand more. Time to upgrade.`,
      ];
    }

    setDrafts({ blog, socialThread, emailTeaser });
    addLog("Copywriter", "All 3 content pieces drafted and saved", "success");
    setStepStatus("copywriter", "done");
  } catch (err) {
    // Safety net for unexpected errors (e.g. store failures).
    // Gemini API failures are already handled per-asset above via Promise.allSettled.
    addLog("Copywriter", `Unexpected error in copywriter: ${err.message}`, "error");
    setStepStatus("copywriter", "error");
  }
}