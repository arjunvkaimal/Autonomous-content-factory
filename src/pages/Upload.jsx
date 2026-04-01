import useStore from "../store/pipelineStore";
import { runResearcher } from "../agents/researcherAgent";
import { runCopywriter } from "../agents/copywriterAgent";
import { runEditor } from "../agents/editorAgent";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const setSourceText = useStore((state) => state.setSourceText);
  const navigate = useNavigate();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    setSourceText(text);

    console.log("TEXT:", text);
  };

  const startPipeline = async () => {
    console.log("Starting pipeline...");

    await runResearcher();
    await runCopywriter();
    await runEditor();

    navigate("/review");
  };

  return (
    <div style={{ color: "white", padding: "20px" }}>
      <input type="file" onChange={handleFile} />
      <br /><br />
      <button onClick={startPipeline}>Start</button>
    </div>
  );
}