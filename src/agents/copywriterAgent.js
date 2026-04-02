import useStore from "../store/pipelineStore";

export async function runCopywriter() {
  const { factSheet, setDrafts, addLog, setStepStatus } = useStore.getState();

  setStepStatus("copywriter", "running");
  addLog("Copywriter", "Starting content generation...", "info");

  const clean = (t) => t ? t.trim().replace(/[.,]+$/, "") : "";

  const fullAudience = clean(factSheet.audience) || "small business owners";
  const valueProposition = clean(factSheet.valueProposition) || "A powerful new product";

  // Shorten audience to a concise label for copy
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

  const featuresList = (factSheet.features || []).slice(0, 5);
  const featuresText = featuresList.map((f) => "- " + clean(f)).join("\n");
  const topFeature = clean(featuresList[0]) || "smart performance";
  const secondFeature = clean(featuresList[1]) || "seamless integration";

  const specsData = factSheet.specs && Object.keys(factSheet.specs).length ? factSheet.specs : {};
  const specsText = Object.entries(specsData).map(([k, v]) => `• ${k}: ${clean(v)}`).join("\n");

  addLog("Copywriter", "Writing blog post...", "info");
  const blog = `${valueProposition}.

Designed for ${audience}, this is a next-generation solution built to solve real problems at scale.

${featuresText.length > 0 ? `Key Features:\n${featuresText}` : ""}

${specsText.length > 0 ? `Specifications:\n${specsText}` : ""}

Every detail has been engineered to deliver reliability and real-world impact — without unnecessary complexity. Whether you're looking to save time, cut costs, or simply offer better experiences to your customers, this platform delivers.

The result: a smarter, more capable tool that fits naturally into your workflow and actually makes a difference.
`;

  addLog("Copywriter", "Blog post complete ✓", "success");
  addLog("Copywriter", "Writing social thread...", "info");

  const socialThread = [
    `🚀 Introducing the next big thing for ${audience}.`,
    `💡 ${valueProposition}.`,
    featuresText.length > 0
      ? `✅ Standout feature: ${topFeature}.`
      : `✅ Engineered for real-world performance.`,
    secondFeature
      ? `⚡ Also: ${secondFeature}.`
      : `⚡ Thoughtfully designed for daily use.`,
    `🎯 Built for ${audience} who demand more. Time to upgrade.`,
  ];

  addLog("Copywriter", `Social thread: ${socialThread.length} posts ✓`, "success");
  addLog("Copywriter", "Writing email teaser...", "info");

  const emailTeaser = `Subject: Something new for ${audience} — you'll want to see this.

Hi there,

${valueProposition}.

We built this for people like you — ${audience} who want performance, simplicity, and results.

${topFeature ? `Here's what sets it apart: ${topFeature}.` : ""}

Ready to see it in action? Hit reply or visit our site to learn more.

— The Team`;

  addLog("Copywriter", "Email teaser complete ✓", "success");

  setDrafts({ blog, socialThread, emailTeaser });
  addLog("Copywriter", "All 3 content pieces drafted and saved", "success");
  setStepStatus("copywriter", "done");
}