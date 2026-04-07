import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../store/pipelineStore";
import { useNavigate } from "react-router-dom";

const SPRING = { type: "spring", stiffness: 300, damping: 25 };
const SPRING_SLOW = { type: "spring", stiffness: 200, damping: 28 };

const PIPELINE_STEPS = [
  { id: "01", label: "Research", desc: "Extracts structured product data from your doc" },
  { id: "02", label: "Copywrite", desc: "Generates blog, social thread & email copy" },
  { id: "03", label: "Edit", desc: "Reviews, refines and approves all outputs" },
];

export default function Upload() {
  const setSourceText = useStore((s) => s.setSourceText);
  const sourceText = useStore((s) => s.sourceText);
  const navigate = useNavigate();
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setSourceText(text);
    setError(null);
  };

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const start = () => {
    if (!sourceText.trim()) {
      setError("Drop a document first to fuel the pipeline.");
      return;
    }
    navigate("/agent-room");
  };

  return (
    <div style={S.page}>
      {/* ── Left panel — hero ──────────────────────────────────────────── */}
      <motion.div
        style={S.left}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={SPRING_SLOW}
      >
        {/* Eyebrow */}
        <div style={S.eyebrow}>
          <span style={S.eyebrowDot} />
          <span style={S.eyebrowText}>AI-Powered Content Pipeline</span>
        </div>

        <h1 style={S.headline}>
          Autonomous<br />
          <span style={S.accentWord}>Content</span><br />
          Factory.
        </h1>

        <p style={S.body}>
          Upload a product brief. Three AI agents research it, write
          your blog post, social thread, and email — then hand you
          polished copy ready to publish.
        </p>

        {/* Pipeline step list */}
        <div style={S.stepList}>
          {PIPELINE_STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              style={S.stepRow}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.1 + i * 0.08 }}
            >
              <span style={S.stepId}>{step.id}</span>
              <div>
                <div style={S.stepLabel}>{step.label}</div>
                <div style={S.stepDesc}>{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Right panel — upload ──────────────────────────────────────── */}
      <motion.div
        style={S.right}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={SPRING_SLOW}
      >
        <div style={S.formCard}>
          <div style={S.formHeader}>
            <span style={S.formTag}>BRIEF UPLOAD</span>
            <span style={S.formTag}>.TXT / .MD</span>
          </div>

          {/* Drop zone */}
          <motion.label
            style={{
              ...S.dropzone,
              borderColor: isDragging
                ? "var(--accent)"
                : fileName
                ? "var(--accent-border)"
                : "var(--border-mid)",
              background: isDragging
                ? "var(--accent-dim)"
                : fileName
                ? "rgba(200,241,53,0.04)"
                : "var(--bg-surface)",
              boxShadow: isDragging
                ? "var(--shadow-accent)"
                : fileName
                ? "3px 3px 0px rgba(200,241,53,0.2)"
                : "var(--shadow-hard)",
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            whileHover={{ y: -2 }}
            transition={SPRING}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleInputChange}
              style={{ display: "none" }}
            />

            <AnimatePresence mode="wait">
              {fileName ? (
                <motion.div
                  key="file"
                  style={S.dropContent}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={SPRING}
                >
                  <div style={S.fileIconWrap}>
                    <FileIcon />
                  </div>
                  <div style={S.fileName}>{fileName}</div>
                  <div style={S.fileReplace}>Click to replace file</div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  style={S.dropContent}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={SPRING}
                >
                  <div style={S.uploadIconWrap}>
                    <UploadIcon />
                  </div>
                  <div style={S.dropTitle}>Drop your brief here</div>
                  <div style={S.dropSub}>or click to browse</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.label>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                style={S.error}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={SPRING}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            style={{
              ...S.btn,
              opacity: sourceText ? 1 : 0.38,
              cursor: sourceText ? "pointer" : "not-allowed",
            }}
            onClick={start}
            whileHover={sourceText ? { y: -2, boxShadow: "var(--shadow-accent)" } : {}}
            whileTap={sourceText ? { scale: 0.97 } : {}}
            transition={SPRING}
          >
            <span>Launch Pipeline</span>
            <ArrowIcon />
          </motion.button>

          <p style={S.formFooter}>
            No data leaves your browser — agents run locally via your API key.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Inline SVG icons ───────────────────────────────────────────────── */
function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100svh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "var(--bg)",
    position: "relative",
    zIndex: 1,
  },

  /* Left */
  left: {
    padding: "clamp(40px, 6vw, 80px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 32,
    borderRight: "1px solid var(--border)",
    minHeight: "100svh",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  eyebrowDot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--accent)",
    animation: "pulse-dot 2s ease-in-out infinite",
  },
  eyebrowText: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  },
  headline: {
    fontSize: "clamp(40px, 5.5vw, 72px)",
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    letterSpacing: "-0.04em",
    lineHeight: 1.0,
    color: "var(--text-primary)",
  },
  accentWord: {
    color: "var(--accent)",
  },
  body: {
    fontSize: 15,
    lineHeight: 1.75,
    color: "var(--text-secondary)",
    maxWidth: 420,
  },

  stepList: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    borderTop: "1px solid var(--border)",
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 20,
    padding: "16px 0",
    borderBottom: "1px solid var(--border)",
  },
  stepId: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-muted)",
    letterSpacing: "0.06em",
    paddingTop: 2,
    minWidth: 24,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    color: "var(--text-primary)",
    letterSpacing: "-0.01em",
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },

  /* Right */
  right: {
    padding: "clamp(40px, 6vw, 80px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    minHeight: "100svh",
    background: "var(--bg-surface)",
  },
  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
  },
  formHeader: {
    display: "flex",
    gap: 8,
    marginBottom: 4,
  },
  formTag: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    padding: "3px 8px",
    border: "1px solid var(--border-mid)",
    background: "var(--bg-elevated)",
  },

  dropzone: {
    width: "100%",
    border: "1px solid var(--border-mid)",
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
    minHeight: 200,
  },
  dropContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  uploadIconWrap: {
    color: "var(--text-muted)",
    marginBottom: 4,
  },
  dropTitle: {
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    color: "var(--text-primary)",
    letterSpacing: "-0.01em",
  },
  dropSub: {
    fontSize: 12,
    color: "var(--text-muted)",
  },
  fileIconWrap: {
    color: "var(--accent)",
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--accent)",
    fontFamily: "var(--font-mono)",
    maxWidth: 300,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "center",
  },
  fileReplace: {
    fontSize: 11,
    color: "var(--text-muted)",
  },

  error: {
    fontSize: 12,
    color: "var(--error)",
    fontFamily: "var(--font-mono)",
    padding: "8px 12px",
    border: "1px solid rgba(255,82,82,0.3)",
    background: "rgba(255,82,82,0.06)",
  },

  btn: {
    width: "100%",
    padding: "16px 24px",
    border: "1px solid var(--accent)",
    background: "var(--accent)",
    color: "#080909",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "var(--font-heading)",
    letterSpacing: "-0.01em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "var(--shadow-hard)",
    transition: "box-shadow 0.15s, opacity 0.15s",
  },

  formFooter: {
    fontSize: 11,
    color: "var(--text-muted)",
    textAlign: "center",
    lineHeight: 1.6,
  },
};