import useStore from "../store/pipelineStore";

export async function runResearcher() {
  const { sourceText, setFactSheet } = useStore.getState();

  console.log("Researcher running...");

  const lines = sourceText.split("\n");

  let features = [];
  let specs = {};
  let audience = "";
  let valueProposition = "";

  let currentSection = "";

  const scoreLine = (line) => {
    let score = 0;
    const lower = line.toLowerCase();

    if (lower.includes("ai")) score += 3;
    if (lower.includes("smart")) score += 2;
    if (line.length > 20) score += 1;

    return score;
  };

  lines.forEach((line) => {
    const clean = line.trim();
    const lower = clean.toLowerCase();

    if (!clean) return;

    // detect sections
    if (lower.includes("feature")) currentSection = "features";
    else if (lower.includes("spec")) currentSection = "specs";
    else if (lower.includes("audience")) currentSection = "audience";
    else if (lower.includes("value")) currentSection = "value";

    // extract based on section
    else if (currentSection === "features" && clean.startsWith("-")) {
      features.push(clean.replace("-", "").trim());
    }

    else if (currentSection === "specs" && clean.includes(":")) {
      let line = clean.replace("-", "").trim();   

      const [key, value] = line.split(":");

      if (key && value) {
        specs[key.trim()] = value.trim();
      }
    }

    else if (currentSection === "audience") {
      audience = clean;
    }

    else if (currentSection === "value") {
      valueProposition = clean;
    }
  });

  // apply scoring
  features = features
    .map((f) => ({ text: f, score: scoreLine(f) }))
    .sort((a, b) => b.score - a.score)
    .map((f) => f.text);

  setFactSheet({
    features,
    specs,
    audience,
    valueProposition,
  });

  console.log("FACT SHEET:", {
    features,
    specs,
    audience,
    valueProposition,
  });
}