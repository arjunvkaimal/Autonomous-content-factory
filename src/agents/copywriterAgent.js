import useStore from "../store/pipelineStore";
import { generateContent } from "./geminiAgent";

export async function runCopywriter(tone = "professional") {
  const { factSheet, setDrafts, addLog, setStepStatus } = useStore.getState();

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

    const blogPrompt = `You are an expert copywriter. Write a blog post about the following product/topic. The tone should be ${tone}. Ensure you highlight the value proposition and key features naturally within the text. Fact Sheet: ${JSON.stringify(safeFactSheet)}`;

    const emailPrompt = `You are an expert marketer. Write a promotional email based on the following fact sheet. The tone should be ${tone}. Include an engaging subject line, a hook, a body explaining the core features, and a strong call to action. Fact Sheet: ${JSON.stringify(safeFactSheet)}`;

    const socialPrompt = `You are a social media manager. Create a cohesive thread of 3 social media posts based on the following fact sheet. The tone should be ${tone}. Each post must be under 280 characters. Return the response ONLY as a valid JSON array of strings, where each string is a single post. Do not include markdown formatting like \`\`\`json. Fact Sheet: ${JSON.stringify(safeFactSheet)}`;

    const [blogRaw, emailRaw, socialRaw] = await Promise.all([
      generateContent(blogPrompt),
      generateContent(emailPrompt),
      generateContent(socialPrompt),
    ]);

    const cleanedSocial = socialRaw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const socialThread = JSON.parse(cleanedSocial);

    addLog("Copywriter", "Blog post complete ✓", "success");
    addLog("Copywriter", `Social thread: ${socialThread.length} posts ✓`, "success");
    addLog("Copywriter", "Email teaser complete ✓", "success");

    setDrafts({ blog: blogRaw, socialThread, emailTeaser: emailRaw });
    addLog("Copywriter", "All 3 content pieces drafted and saved", "success");
    setStepStatus("copywriter", "done");
  } catch (err) {
    addLog("Copywriter", `Gemini API failed — using template fallback. (${err.message})`, "warn");

    const blog = `${valueProposition}.

Designed for ${audience}, this is a next-generation solution built to solve real problems at scale.

${featuresText.length > 0 ? `Key Features:\n${featuresText}` : ""}

${specsText.length > 0 ? `Specifications:\n${specsText}` : ""}

Every detail has been engineered to deliver reliability and real-world impact — without unnecessary complexity. Whether you're looking to save time, cut costs, or simply offer better experiences to your customers, this platform delivers.

The result: a smarter, more capable tool that fits naturally into your workflow and actually makes a difference.
`;

    const socialThread = [
      `🚀 Introducing the next big thing for ${audience}.`,
      `💡 ${valueProposition}.`,
      featuresText.length > 0
        ? `✅ Standout feature: ${topFeature}.`
        : `✅ Engineered for real-world performance.`,
      secondFeature ? `⚡ Also: ${secondFeature}.` : `⚡ Thoughtfully designed for daily use.`,
      `🎯 Built for ${audience} who demand more. Time to upgrade.`,
    ];

    const emailTeaser = `Subject: Something new for ${audience} — you'll want to see this.

Hi there,

${valueProposition}.

We built this for people like you — ${audience} who want performance, simplicity, and results.

${topFeature ? `Here's what sets it apart: ${topFeature}.` : ""}

Ready to see it in action? Hit reply or visit our site to learn more.

— The Team`;

    setDrafts({ blog, socialThread, emailTeaser });
    addLog("Copywriter", "Fallback content saved ✓", "success");
    setStepStatus("copywriter", "done");
  }
}