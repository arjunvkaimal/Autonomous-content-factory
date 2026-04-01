import useStore from "../store/pipelineStore";

export async function runResearcher() {
  const { sourceText, setFactSheet } = useStore.getState();

  console.log("Researcher running...");

  const lines = sourceText.split("\n");

  let features = [];
  let specs = {};
  let audience = "";
  let valueProposition = [];

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    // feature detection
    if (lower.includes("feature") || lower.includes("-")) {
      features.push(line.replace("-", "").trim());
    }

    // specs detection (key: value)
    if (line.includes(":")) {
      const [key, value] = line.split(":");
      if (key && value) {
        specs[key.trim()] = value.trim();
      }
    }

    // audience detection
    if (lower.includes("audience") || lower.includes("users")) {
      audience = line;
    }

    // value proposition
    if (lower.includes("value") || lower.includes("benefit")) {
      valueProposition.push(line);
    }
  });

  setFactSheet({
    features,
    specs,
    audience,
    valueProposition: valueProposition.join(" "),
  });
}