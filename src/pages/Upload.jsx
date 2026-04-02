import useStore from "../store/pipelineStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Upload() {
  const setSourceText = useStore((s) => s.setSourceText);
  const sourceText = useStore((s) => s.sourceText);
  const navigate = useNavigate();
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setSourceText(text);
    setError(null);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setSourceText(text);
    setError(null);
  };

  const start = () => {
    if (!sourceText.trim()) {
      setError("Please upload a document first.");
      return;
    }
    navigate("/agent-room");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.icon}>⚙️</div>

        <h1 style={styles.title}>Autonomous Content Factory</h1>
        <p style={styles.subtitle}>
          Upload a product brief and let AI agents generate blog posts,
          social threads, and email teasers automatically.
        </p>

        {/* Drop zone */}
        <label
          style={{
            ...styles.dropzone,
            borderColor: fileName ? "#6366f1" : "rgba(255,255,255,0.12)",
            background: fileName ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          {fileName ? (
            <>
              <span style={styles.fileIcon}>📄</span>
              <span style={styles.fileName}>{fileName}</span>
              <span style={styles.fileHint}>Click to replace</span>
            </>
          ) : (
            <>
              <span style={styles.uploadIcon}>📁</span>
              <span style={styles.dropText}>Drop your brief here</span>
              <span style={styles.dropHint}>or click to browse — .txt, .md supported</span>
            </>
          )}
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{
            ...styles.button,
            opacity: sourceText ? 1 : 0.4,
            cursor: sourceText ? "pointer" : "not-allowed",
          }}
          onClick={start}
        >
          Launch Pipeline →
        </button>

        {/* Pipeline steps preview */}
        <div style={styles.stepsPreview}>
          {["🔍 Research", "✍️ Copywrite", "✅ Edit"].map((step, i) => (
            <div key={i} style={styles.stepChip}>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #0d1117 60%, #0f172a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "48px 40px",
    maxWidth: 520,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
  },
  icon: { fontSize: 40, marginBottom: 12 },
  title: {
    margin: "0 0 10px",
    fontSize: 24,
    fontWeight: 800,
    background: "linear-gradient(90deg, #a78bfa, #6366f1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "0 0 28px",
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.7,
    textAlign: "center",
  },
  dropzone: {
    width: "100%",
    border: "2px dashed",
    borderRadius: 16,
    padding: "32px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    transition: "all 0.3s",
    boxSizing: "border-box",
    marginBottom: 16,
  },
  uploadIcon: { fontSize: 32 },
  fileIcon: { fontSize: 32 },
  dropText: { fontSize: 15, fontWeight: 600, color: "#e2e8f0" },
  dropHint: { fontSize: 12, color: "#475569" },
  fileName: { fontSize: 14, fontWeight: 600, color: "#a78bfa" },
  fileHint: { fontSize: 12, color: "#475569" },
  error: { color: "#f87171", fontSize: 13, margin: "0 0 8px" },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    marginBottom: 20,
    boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
  },
  stepsPreview: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  stepChip: {
    padding: "5px 12px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
  },
};