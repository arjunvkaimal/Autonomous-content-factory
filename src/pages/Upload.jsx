import useStore from "../store/pipelineStore";
import { runResearcher } from "../agents/researcherAgent";
import { runCopywriter } from "../agents/copywriterAgent";
import { runEditor } from "../agents/editorAgent";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const setSourceText = useStore((s) => s.setSourceText);
  const navigate = useNavigate();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    setSourceText(text);
  };

  const start = async () => {
    await runResearcher();
    await runCopywriter();
    await runEditor();
    navigate("/review");
  };

  return (
    <div style={{ color: "white", padding: 20 }}>
      <input type="file" onChange={handleFile} />
      <br /><br />
      <button onClick={start}>Start</button>
    </div>
  );
}