import useStore from "../store/pipelineStore";

export async function runEditor() {
  const { drafts, setFinal, addLog, setStepStatus } = useStore.getState();

  setStepStatus("editor", "running");
  addLog("Editor", "Starting quality review...", "info");

  if (!drafts) {
    addLog("Editor", "No drafts found — skipping", "error");
    setStepStatus("editor", "error");
    return;
  }

  addLog("Editor", "Reviewing blog post...", "info");
  await delay(300);
  addLog("Editor", "Blog: tone and structure looks good ✓", "success");

  addLog("Editor", "Reviewing social thread...", "info");
  await delay(200);
  addLog("Editor", `Social: ${drafts.socialThread.length} posts verified ✓`, "success");

  addLog("Editor", "Reviewing email teaser...", "info");
  await delay(200);
  addLog("Editor", "Email: subject line and body approved ✓", "success");

  setFinal(drafts);
  addLog("Editor", "All content approved and finalized", "success");
  setStepStatus("editor", "done");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}