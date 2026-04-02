import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/pipelineStore";
import { runResearcher } from "../agents/researcherAgent";
import { runCopywriter } from "../agents/copywriterAgent";
import { runEditor } from "../agents/editorAgent";

// ── Agent metadata ─────────────────────────────────────────────────────────
const STEPS = [
  {
    key: "researcher",
    label: "Researcher",
    icon: "🔍",
    description: "Parses the document and extracts structured product data",
    color: "#6366f1",
  },
  {
    key: "copywriter",
    label: "Copywriter",
    icon: "✍️",
    description: "Writes blog post, social thread, and email teaser",
    color: "#8b5cf6",
  },
  {
    key: "editor",
    label: "Editor",
    icon: "✅",
    description: "Reviews and approves all generated content",
    color: "#a78bfa",
  },
];

// ── Log type colors ────────────────────────────────────────────────────────
const LOG_COLORS = {
  info: "#94a3b8",
  success: "#34d399",
  warn: "#fbbf24",
  error: "#f87171",
  data: "#60a5fa",
};

const LOG_PREFIXES = {
  info: "›",
  success: "✓",
  warn: "⚠",
  error: "✗",
  data: "·",
};

export default function AgentRoom() {
  const navigate = useNavigate();
  const logRef = useRef(null);
  const hasStarted = useRef(false);
  const [countdown, setCountdown] = useState(null);

  const { stepStatuses, agentLogs, pipelineStatus, setPipelineStatus, resetPipeline } =
    useStore();

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [agentLogs]);

  // Run pipeline on mount
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

        // countdown to navigate
        let c = 3;
        setCountdown(c);
        const timer = setInterval(() => {
          c -= 1;
          setCountdown(c);
          if (c <= 0) {
            clearInterval(timer);
            navigate("/review");
          }
        }, 1000);
      } catch (err) {
        setPipelineStatus("error");
        useStore.getState().addLog("System", `Pipeline failed: ${err.message}`, "error");
      }
    }

    runPipeline();
  }, []);

  const totalSteps = STEPS.length;
  const doneSteps = STEPS.filter((s) => stepStatuses[s.key] === "done").length;
  const progressPct = (doneSteps / totalSteps) * 100;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Agent Room</h1>
          <p style={styles.subtitle}>
            {pipelineStatus === "idle" && "Initialising pipeline..."}
            {pipelineStatus === "running" && "Pipeline running — agents are working"}
            {pipelineStatus === "done" &&
              `Pipeline complete! Navigating to review in ${countdown}s...`}
            {pipelineStatus === "error" && "Pipeline encountered an error"}
          </p>
        </div>
        <StatusBadge status={pipelineStatus} />
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            width: `${progressPct}%`,
            background:
              pipelineStatus === "done"
                ? "linear-gradient(90deg, #34d399, #6ee7b7)"
                : "linear-gradient(90deg, #6366f1, #a78bfa)",
          }}
        />
      </div>

      {/* Step cards */}
      <div style={styles.stepsRow}>
        {STEPS.map((step, idx) => {
          const status = stepStatuses[step.key];
          return (
            <StepCard
              key={step.key}
              step={step}
              status={status}
              stepNumber={idx + 1}
            />
          );
        })}
      </div>

      {/* Pipeline connector line behind cards */}
      <div style={styles.connectorWrapper}>
        {STEPS.slice(0, -1).map((step, idx) => {
          const nextStep = STEPS[idx + 1];
          const active =
            stepStatuses[step.key] === "done" ||
            stepStatuses[nextStep.key] !== "pending";
          return (
            <div
              key={idx}
              style={{
                ...styles.connector,
                background: active ? "#6366f1" : "rgba(255,255,255,0.1)",
              }}
            />
          );
        })}
      </div>

      {/* Log terminal */}
      <div style={styles.terminal}>
        <div style={styles.terminalHeader}>
          <span style={styles.terminalDot("#f87171")} />
          <span style={styles.terminalDot("#fbbf24")} />
          <span style={styles.terminalDot("#34d399")} />
          <span style={styles.terminalTitle}>Execution Logs</span>
          <span style={styles.logCount}>{agentLogs.length} entries</span>
        </div>
        <div ref={logRef} style={styles.terminalBody}>
          {agentLogs.length === 0 && (
            <div style={{ color: "#475569", fontStyle: "italic" }}>
              Waiting for agents to start...
            </div>
          )}
          {agentLogs.map((log) => (
            <div key={log.id} style={styles.logLine}>
              <span style={styles.logTime}>{log.time}</span>
              <span
                style={{
                  ...styles.logAgent,
                  color: STEPS.find((s) => s.label === log.agent)?.color || "#94a3b8",
                }}
              >
                [{log.agent}]
              </span>
              <span style={{ color: LOG_COLORS[log.type] || "#94a3b8" }}>
                {LOG_PREFIXES[log.type]} {log.message}
              </span>
            </div>
          ))}
          {pipelineStatus === "running" && (
            <div style={styles.cursor}>▋</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function StepCard({ step, status, stepNumber }) {
  const isRunning = status === "running";
  const isDone = status === "done";
  const isError = status === "error";

  return (
    <div
      style={{
        ...styles.card,
        borderColor: isDone
          ? "#34d399"
          : isRunning
          ? step.color
          : isError
          ? "#f87171"
          : "rgba(255,255,255,0.08)",
        boxShadow: isRunning
          ? `0 0 24px ${step.color}44`
          : isDone
          ? "0 0 16px #34d39922"
          : "none",
      }}
    >
      {/* Step number */}
      <div style={{ ...styles.stepNum, background: isRunning || isDone ? step.color : "#1e293b" }}>
        {isDone ? "✓" : stepNumber}
      </div>

      {/* Icon + label */}
      <div style={{ ...styles.cardIcon, filter: isRunning ? "none" : isDone ? "none" : "grayscale(0.6) opacity(0.5)" }}>
        {step.icon}
      </div>
      <div style={styles.cardLabel}>{step.label}</div>
      <div style={styles.cardDesc}>{step.description}</div>

      {/* Status badge */}
      <div
        style={{
          ...styles.statusChip,
          background: isDone
            ? "#34d39922"
            : isRunning
            ? `${step.color}22`
            : isError
            ? "#f8717122"
            : "rgba(255,255,255,0.04)",
          color: isDone
            ? "#34d399"
            : isRunning
            ? step.color
            : isError
            ? "#f87171"
            : "#475569",
          border: `1px solid ${isDone ? "#34d39944" : isRunning ? `${step.color}44` : "transparent"}`,
        }}
      >
        {isRunning && <PulsingDot color={step.color} />}
        {isDone && "Done"}
        {isError && "Error"}
        {!isRunning && !isDone && !isError && "Pending"}
      </div>
    </div>
  );
}

function PulsingDot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        marginRight: 6,
        animation: "pulse 1.2s ease-in-out infinite",
      }}
    />
  );
}

function StatusBadge({ status }) {
  const map = {
    idle: { label: "Idle", color: "#475569" },
    running: { label: "Running", color: "#6366f1" },
    done: { label: "Complete", color: "#34d399" },
    error: { label: "Error", color: "#f87171" },
  };
  const s = map[status] || map.idle;
  return (
    <div
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        background: `${s.color}18`,
        border: `1px solid ${s.color}44`,
        color: s.color,
        fontSize: 13,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {status === "running" && <PulsingDot color={s.color} />}
      {s.label}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #0d1117 60%, #0f172a 100%)",
    padding: "32px 28px",
    fontFamily: "'Inter', sans-serif",
    color: "#f1f5f9",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    background: "linear-gradient(90deg, #a78bfa, #6366f1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  progressTrack: {
    height: 4,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 28,
  },
  progressBar: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.6s ease",
  },
  stepsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 28,
    position: "relative",
  },
  connectorWrapper: {
    display: "none", // handled with card borders instead
  },
  connector: {
    flex: 1,
    height: 2,
    transition: "background 0.4s",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 8,
    transition: "border-color 0.4s, box-shadow 0.4s",
    position: "relative",
  },
  stepNum: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: "translateX(-50%)",
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    border: "2px solid #0f0f1a",
    transition: "background 0.4s",
  },
  cardIcon: {
    fontSize: 32,
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: "#e2e8f0",
  },
  cardDesc: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.5,
  },
  statusChip: {
    marginTop: 8,
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    transition: "all 0.4s",
  },
  terminal: {
    background: "#090d14",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
  },
  terminalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
  },
  terminalDot: (color) => ({
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: color,
  }),
  terminalTitle: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    flex: 1,
  },
  logCount: {
    fontSize: 11,
    color: "#334155",
    fontFamily: "monospace",
  },
  terminalBody: {
    padding: "14px 16px",
    height: 280,
    overflowY: "auto",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: 12,
    lineHeight: "22px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  logLine: {
    display: "flex",
    gap: 8,
    alignItems: "baseline",
  },
  logTime: {
    color: "#1e293b",
    minWidth: 70,
    fontSize: 11,
  },
  logAgent: {
    minWidth: 100,
    fontWeight: 600,
    fontSize: 11,
  },
  cursor: {
    color: "#6366f1",
    animation: "blink 1s step-end infinite",
    marginTop: 2,
  },
};