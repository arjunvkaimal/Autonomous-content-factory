import useStore from "../store/pipelineStore";
import { runGemini } from "./geminiAgent";

export async function runResearcher() {
  const { sourceText, setFactSheet } = useStore.getState();

  try {
    const aiData = await runGemini(sourceText);

    setFactSheet({
      features: aiData.features.slice(0, 5),
      specs: aiData.specs,
      audience: aiData.audience,
      valueProposition: aiData.valueProposition,
      warnings: [],
    });

    return;
  } catch {
    const lines = sourceText.split("\n").filter((l) => l.trim());

    setFactSheet({
      features: lines.slice(0, 3),
      specs: {},
      audience: "general users",
      valueProposition: lines[0] || "General utility",
      warnings: ["Fallback mode used"],
    });
  }
}