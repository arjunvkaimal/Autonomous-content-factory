import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../store/pipelineStore";
import { runResearcher } from "../agents/researcherAgent";
import { runCopywriter } from "../agents/copywriterAgent";
import { runEditor } from "../agents/editorAgent";

/* ─── Spring physics ──────────────────────────────────────────────────── */
const SPRING = { type: "spring", stiffness: 300, damping: 25 };
const SPRING_SNAP = { type: "spring", stiffness: 380, damping: 28 };

/* ─── Icon components (defined before STEPS to avoid hoisting issues) ─── */
function ResearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

const STEP_ICONS = { researcher: ResearchIcon, copywriter: CopyIcon, editor: EditIcon };

/* ─── Agent metadata ──────────────────────────────────────────────────── */
const STEPS = [
  {
    key: "researcher",
    label: "Researcher",
    num: "01",
    description: "Parses the document and extracts structured product data",
  },
  {
    key: "copywriter",
    label: "Copywriter",
    num: "02",
    description: "Writes blog post, social thread, and email teaser",
  },
  {
    key: "editor",
    label: "Editor",
    num: "03",
    description: "Reviews, refines and approves all generated content",
  },
];

const LOG_COLORS = {
  info:    "var(--text-secondary)",
  success: "var(--success)",
  warn:    "var(--warn)",
  error:   "var(--error)",
  data:    "var(--info)",
};
const LOG_PREFIX = { info: "›", success: "✓", warn: "⚠", error: "✗", data: "·" };

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function AgentRoom() {
  const navigate = useNavigate();
  const logRef = useRef(null);
  const hasStarted = useRef(false);
  const [countdown, setCountdown] = useState(null);

  const { stepStatuses, agentLogs, pipelineStatus, setPipelineStatus, resetPipeline } =
    useStore();

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [agentLogs]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    resetPipeline();

    async function runPipeline() {
      setPipelineStatus("running");
      try {
        await runResearcher();
        await runCopywriter();
        await runEditor();
        setPipelineStatus("done");
        let c = 3;
        setCountdown(c);
        const timer = setInterval(() => {
          c -= 1;
          setCountdown(c);
          if (c <= 0) { clearInterval(timer); navigate("/review"); }
        }, 1000);
      } catch (err) {
        setPipelineStatus("error");
        useStore.getState().addLog("System", `Pipeline failed: ${err.message}`, "error");
      }
    }
    runPipeline();
  }, []);

  const doneCount = STEPS.filter((s) => stepStatuses[s.key] === "done").length;
  const progressPct = (doneCount / STEPS.length) * 100;
  const activeStep = STEPS.find((s) => stepStatuses[s.key] === "running");

  return (
    <div style={S.page}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <motion.header
        style={S.topbar}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <div style={S.topbarLeft}>
          <span style={S.topbarEye}>
            <span style={{ ...S.eyebrowDot, background: pipelineStatus === "done" ? "var(--success)" : pipelineStatus === "error" ? "var(--error)" : "var(--accent)", animation: pipelineStatus === "running" ? "pulse-dot 1.4s ease-in-out infinite" : "none" }} />
          </span>
          <span style={S.topbarTitle}>Mission Control</span>
          <span style={S.topbarSep}>/</span>
          <span style={S.topbarSub}>
            {pipelineStatus === "idle"    && "Initialising pipeline…"}
            {pipelineStatus === "running" && (activeStep ? `${activeStep.label} is working` : "Running…")}
            {pipelineStatus === "done"    && `Complete — navigating in ${countdown}s`}
            {pipelineStatus === "error"   && "Pipeline encountered an error"}
          </span>
        </div>
        <PipelineBadge status={pipelineStatus} />
      </motion.header>

      {/* ── Progress bar ────────────────────────────────────────────── */}
      <div style={S.progressTrack}>
        <motion.div
          style={{
            ...S.progressFill,
            background: pipelineStatus === "done"
              ? "var(--success)"
              : "var(--accent)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
        {/* shimmer only while running */}
        {pipelineStatus === "running" && (
          <div style={S.progressShimmer} />
        )}
      </div>

      {/* ── Bento grid ──────────────────────────────────────────────── */}
      <main style={S.bentoGrid}>

        {/* Agent cards — 3 stacked in left col */}
        <section style={S.agentCol}>
          <div style={S.sectionLabel}>AGENTS</div>
          {STEPS.map((step, idx) => (
            <AgentCard
              key={step.key}
              step={step}
              status={stepStatuses[step.key]}
              idx={idx}
            />
          ))}
        </section>

        {/* Right col — metrics + terminal */}
        <section style={S.rightCol}>

          {/* Metrics row */}
          <div style={S.metricsRow}>
            <MetricCell
              label="Agents"
              value={`${doneCount}/${STEPS.length}`}
              sub="completed"
            />
            <MetricCell
              label="Logs"
              value={agentLogs.length}
              sub="entries"
              accent={agentLogs.length > 0}
            />
            <MetricCell
              label="Status"
              value={pipelineStatus.toUpperCase()}
              sub="pipeline"
              accent={pipelineStatus === "done"}
            />
          </div>

          {/* Terminal */}
          <div style={S.terminal}>
            <div style={S.termHeader}>
              <div style={S.termDots}>
                <span style={{ ...S.dot, background: "var(--error)" }} />
                <span style={{ ...S.dot, background: "var(--warn)" }} />
                <span style={{ ...S.dot, background: "var(--success)" }} />
              </div>
              <span style={S.termTitle}>EXECUTION LOG</span>
              <span style={S.termCount}>{agentLogs.length} entries</span>
            </div>
            <div ref={logRef} style={S.termBody}>
              {agentLogs.length === 0 && (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Waiting for agents to start…
                </span>
              )}
              <AnimatePresence initial={false}>
                {agentLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    style={S.logLine}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={SPRING_SNAP}
                  >
                    <span style={S.logTime}>{log.time}</span>
                    <span style={S.logAgent}>[{log.agent}]</span>
                    <span style={{ color: LOG_COLORS[log.type] || "var(--text-secondary)" }}>
                      {LOG_PREFIX[log.type]} {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {pipelineStatus === "running" && (
                <span style={S.cursor}>▋</span>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─── AgentCard ──────────────────────────────────────────────────────── */
function AgentCard({ step, status, idx }) {
  const isRunning = status === "running";
  const isDone    = status === "done";
  const isError   = status === "error";
  const isPending = !isRunning && !isDone && !isError;

  return (
    <motion.div
      style={{
        ...S.agentCard,
        borderColor: isRunning
          ? "var(--accent)"
          : isDone
          ? "var(--success)"
          : isError
          ? "var(--error)"
          : "var(--border-mid)",
        boxShadow: isRunning
          ? "var(--shadow-accent)"
          : isDone
          ? "3px 3px 0 rgba(61,255,160,0.25)"
          : "var(--shadow-hard)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: idx * 0.06 }}
    >
      {/* Number + icon row */}
      <div style={S.cardTopRow}>
        <span style={{ ...S.cardNum, color: isRunning ? "var(--accent)" : isDone ? "var(--success)" : "var(--text-muted)" }}>
          {step.num}
        </span>
        <span style={{ ...S.cardIcon, opacity: isPending ? 0.3 : 1, color: isRunning ? "var(--accent)" : isDone ? "var(--success)" : "var(--text-primary)" }}>
          {(() => { const Icon = STEP_ICONS[step.key]; return Icon ? <Icon /> : null; })()}
        </span>
        <StatusPill status={status} />
      </div>

      <div style={S.cardBody}>
        <div style={S.cardLabel}>{step.label}</div>
        <div style={S.cardDesc}>{step.description}</div>
      </div>

      {/* Running bar */}
      {isRunning && (
        <motion.div
          style={S.runBar}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      )}
      {isDone && <div style={S.doneBar} />}
    </motion.div>
  );
}

/* ─── StatusPill ─────────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const cfg = {
    pending: { label: "PENDING", color: "var(--text-muted)", border: "var(--border-mid)", bg: "transparent" },
    running: { label: "ACTIVE",  color: "var(--accent)",     border: "var(--accent-border)", bg: "var(--accent-dim)" },
    done:    { label: "DONE",    color: "var(--success)",    border: "rgba(61,255,160,0.3)", bg: "rgba(61,255,160,0.08)" },
    error:   { label: "ERROR",   color: "var(--error)",      border: "rgba(255,82,82,0.3)",  bg: "rgba(255,82,82,0.08)" },
  }[status] || {};

  return (
    <motion.span
      style={{ ...S.pill, color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
      layout
      transition={SPRING}
    >
      {status === "running" && (
        <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", marginRight: 5, animation: "pulse-dot 1.2s ease-in-out infinite" }} />
      )}
      {cfg.label}
    </motion.span>
  );
}

/* ─── MetricCell ─────────────────────────────────────────────────────── */
function MetricCell({ label, value, sub, accent }) {
  return (
    <div style={S.metricCell}>
      <div style={{ ...S.metricValue, color: accent ? "var(--accent)" : "var(--text-primary)" }}>
        {value}
      </div>
      <div style={S.metricLabel}>{label}</div>
      <div style={S.metricSub}>{sub}</div>
    </div>
  );
}

/* ─── PipelineBadge ──────────────────────────────────────────────────── */
function PipelineBadge({ status }) {
  const cfg = {
    idle:    { label: "IDLE",     color: "var(--text-muted)", border: "var(--border-mid)" },
    running: { label: "RUNNING",  color: "var(--accent)",     border: "var(--accent-border)" },
    done:    { label: "COMPLETE", color: "var(--success)",    border: "rgba(61,255,160,0.3)" },
    error:   { label: "ERROR",    color: "var(--error)",      border: "rgba(255,82,82,0.3)" },
  }[status] || {};

  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: cfg.color, border: `1px solid ${cfg.border}`, padding: "4px 10px" }}>
      {cfg.label}
    </span>
  );
}



/* ─── Styles ──────────────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100svh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1,
    fontFamily: "var(--font-body)",
    color: "var(--text-primary)",
  },

  /* Topbar */
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    height: 52,
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-surface)",
    flexShrink: 0,
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  topbarEye: { display: "flex", alignItems: "center" },
  eyebrowDot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
  },
  topbarTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "var(--text-primary)",
  },
  topbarSep: { color: "var(--text-muted)", fontSize: 13 },
  topbarSub: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-muted)",
  },

  /* Progress */
  progressTrack: {
    height: 2,
    background: "var(--bg-overlay)",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  progressFill: {
    height: "100%",
    transformOrigin: "left",
  },
  progressShimmer: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
    animation: "shimmer-bar 1.6s linear infinite",
    width: "25%",
  },

  /* Bento grid */
  bentoGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 0,
    overflow: "hidden",
  },

  /* Agent column */
  agentCol: {
    borderRight: "1px solid var(--border)",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.12em",
    color: "var(--text-muted)",
    marginBottom: 4,
  },

  /* Agent card */
  agentCard: {
    border: "1px solid var(--border-mid)",
    background: "var(--bg-surface)",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    position: "relative",
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  cardTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  cardNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.06em",
    minWidth: 22,
  },
  cardIcon: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    transition: "opacity 0.3s, color 0.3s",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  cardLabel: {
    fontFamily: "var(--font-heading)",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "var(--text-primary)",
  },
  cardDesc: {
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.55,
  },
  pill: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  runBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "var(--accent)",
    transformOrigin: "left",
  },
  doneBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "var(--success)",
  },

  /* Right column */
  rightCol: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  /* Metrics */
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  },
  metricCell: {
    padding: "20px 24px",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  metricValue: {
    fontFamily: "var(--font-heading)",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.04em",
    lineHeight: 1,
    transition: "color 0.3s",
  },
  metricLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    marginTop: 4,
  },
  metricSub: {
    fontSize: 11,
    color: "var(--text-muted)",
  },

  /* Terminal */
  terminal: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "var(--bg)",
  },
  termHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-surface)",
    flexShrink: 0,
  },
  termDots: { display: "flex", gap: 5, marginRight: 4 },
  dot: { display: "inline-block", width: 9, height: 9, borderRadius: "50%" },
  termTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    flex: 1,
  },
  termCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--border-light)",
  },
  termBody: {
    padding: "16px 20px",
    flex: 1,
    overflowY: "auto",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    lineHeight: "22px",
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  logLine: {
    display: "flex",
    gap: 10,
    alignItems: "baseline",
  },
  logTime: {
    color: "var(--border-light)",
    minWidth: 68,
    fontSize: 10,
    flexShrink: 0,
  },
  logAgent: {
    color: "var(--accent)",
    minWidth: 100,
    fontWeight: 500,
    fontSize: 11,
    flexShrink: 0,
  },
  cursor: {
    color: "var(--accent)",
    animation: "blink-cursor 1s step-end infinite",
    marginTop: 2,
  },
};