import useStore from "../store/pipelineStore";

export async function runEditor() {
  const { drafts, setFinal } = useStore.getState();

  if (!drafts) return;

  setFinal(drafts);
}