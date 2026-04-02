import useStore from "../store/pipelineStore";

export async function runCopywriter() {
  const { factSheet, setDrafts } = useStore.getState();

  const clean = (t) => (t ? t.trim().replace(/[.,]+$/, "") : "");

  const audience = clean(factSheet.audience) || "users";

  const featuresText = (factSheet.features || [])
    .slice(0, 5)
    .map((f) => "- " + clean(f))
    .join("\n");

  const specsData =
    factSheet.specs && Object.keys(factSheet.specs).length
      ? factSheet.specs
      : {
          Battery: "Long lasting battery",
          Connectivity: "Wireless",
        };

  const specsText = Object.entries(specsData)
    .map(([k, v]) => `${k}: ${clean(v)}`)
    .join("\n");

  const blog = `
${clean(factSheet.valueProposition)}.

Designed for ${audience}, this product delivers a powerful combination of intelligent tracking and user focused design.

Key Features:
${featuresText}

These features enable users to monitor important aspects of their daily activities and health.

With specifications such as:
${specsText}

The product is engineered to support modern lifestyles and deliver consistent performance.

For ${audience}, this translates into improved awareness and better outcomes.

Overall, this solution enhances efficiency usability and overall performance.
`;

  const socialThread = [
    "New product launched",
    `Built for ${audience}`,
    "Smart features included",
    "Upgrade your experience today",
  ];

  const emailTeaser = `
Discover a smarter way to improve your workflow.
Designed for ${audience}.
`;

  setDrafts({ blog, socialThread, emailTeaser });
}