import useStore from "../store/pipelineStore";

export async function runEditor() {
  const { drafts, setFinal } = useStore.getState();

  console.log("Editor running...");

  if (!drafts || !drafts.blog) {
    console.log("Invalid drafts");
    return;
  }

  setFinal(drafts);

  console.log("FINAL:", drafts);
}