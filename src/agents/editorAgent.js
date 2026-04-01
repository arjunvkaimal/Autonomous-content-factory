import useStore from "../store/pipelineStore";

export async function runEditor() {
  const { drafts, setFinal } = useStore.getState();

  console.log("Editor running...");

  // basic validation
  if (!drafts || !drafts.blog) {
    console.log("Invalid content → fallback");
    return;
  }

  setFinal(drafts);
}