import useStore from "../store/pipelineStore";

export async function runCopywriter() {
  const { factSheet, setDrafts } = useStore.getState();

  console.log("Copywriter running...");

  // helper to clean text
  const cleanText = (text) => {
    if (!text) return "";
    return text.trim().replace(/[.,]+$/, "");
  };

  const audience = cleanText(factSheet.audience) || "users";

  // features (limit + clean)
  const featuresText = factSheet.features
    .slice(0, 5)
    .map((f) => "- " + cleanText(f))
    .join("\n");

  // specs (no dash, clean format)
  const specsText = Object.entries(factSheet.specs)
    .map(([k, v]) => `${k}: ${cleanText(v)}`)
    .join("\n");

  // blog content
  const blog = `
${cleanText(factSheet.valueProposition) || "A powerful new solution"}.

Designed for ${audience}, this product delivers:

${featuresText}

With specifications such as:
${specsText}

This solution enhances efficiency usability and performance.
`;

  // social thread
  const socialThread = [
    "New product launched",
    `Built for ${audience}`,
    "Smart features included",
    "Upgrade your experience today",
  ];

  // email
  const emailTeaser = `
Discover a smarter way to improve your workflow.
Designed for ${audience}.
`;

  setDrafts({
    blog,
    socialThread,
    emailTeaser,
  });

  console.log("DRAFTS:", {
    blog,
    socialThread,
    emailTeaser,
  });
}