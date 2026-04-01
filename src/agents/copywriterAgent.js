import useStore from "../store/pipelineStore";

export async function runCopywriter() {
  const { factSheet, setDrafts } = useStore.getState();

  console.log("Copywriter running...");

  const blog = `
Introducing a powerful solution designed for ${factSheet.audience || "modern users"}.

Key Features:
${factSheet.features.map(f => "- " + f).join("\n")}

Specifications:
${Object.entries(factSheet.specs)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}

Why it matters:
${factSheet.valueProposition || "Enhances productivity and efficiency."}
`;

  const socialThread = [
    "🚀 New Product Launch!",
    `Built for ${factSheet.audience || "everyone"}`,
    "Packed with smart features",
    "Upgrade your experience today",
  ];

  const emailTeaser = `
Discover a smarter way to improve your workflow.
Designed for ${factSheet.audience || "users"}.
`;

  setDrafts({
    blog,
    socialThread,
    emailTeaser,
  });
}