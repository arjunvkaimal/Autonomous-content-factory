import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useStore from "../store/pipelineStore";

const SPRING = { type: "spring", stiffness: 300, damping: 25 };

const CONTENT_SECTIONS = [
  { key: "blog",         label: "Blog Post",     tag: "LONG-FORM", filename: "blog-post.txt"         },
  { key: "socialThread", label: "Social Thread",  tag: "THREADS",   filename: "social-thread.txt"     },
  { key: "emailTeaser",  label: "Email Teaser",   tag: "EMAIL",     filename: "email-teaser.txt"      },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function getTextContent(final, key) {
  if (key === "socialThread") return (Array.isArray(final.socialThread) ? final.socialThread : []).join("\n\n");
  return final[key] ?? "";
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAll(final) {
  const sections = [
    { title: "BLOG POST",     content: final.blog ?? ""                      },
    { title: "SOCIAL THREAD", content: (final.socialThread ?? []).join("\n\n") },
    { title: "EMAIL TEASER",  content: final.emailTeaser ?? ""               },
  ];

  const divider = "─".repeat(60);
  const combined = sections
    .map((s) => `${divider}\n${s.title}\n${divider}\n\n${s.content}`)
    .join("\n\n\n");

  downloadFile("acf-all-outputs.txt", combined);
}

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function FinalReview() {
  const final = useStore((s) => s.final);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("blog");
  const [copied, setCopied]   = useState(false);
  const [dlFlash, setDlFlash] = useState(false);   // flash on "Download All"

  if (!final) {
    return (
      <div style={S.loading}>
        <span style={S.loadingDot} />
        <span style={S.loadingText}>Loading content…</span>
      </div>
    );
  }

  const currentMeta = CONTENT_SECTIONS.find((s) => s.key === activeSection);

  const handleCopy = () => {
    navigator.clipboard.writeText(getTextContent(final, activeSection));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    downloadFile(currentMeta.filename, getTextContent(final, activeSection));
  };

  const handleDownloadAll = () => {
    downloadAll(final);
    setDlFlash(true);
    setTimeout(() => setDlFlash(false), 2000);
  };

  return (
    <div style={S.page}>

      {/* ── Left sidebar ─────────────────────────────────────────────── */}
      <motion.aside
        style={S.sidebar}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={SPRING}
      >
        {/* Wordmark */}
        <div style={S.sidebarTop}>
          <div style={S.wordmark}>ACF</div>
          <div style={S.wordmarkSub}>Content Factory</div>
        </div>

        {/* Section nav */}
        <nav style={S.nav}>
          <div style={S.navGroupLabel}>OUTPUT</div>
          {CONTENT_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.key;
            return (
              <motion.button
                key={sec.key}
                style={{
                  ...S.navItem,
                  background:   isActive ? "var(--bg-overlay)" : "transparent",
                  borderColor:  isActive ? "var(--accent-border)" : "transparent",
                  color:        isActive ? "var(--text-primary)" : "var(--text-muted)",
                }}
                onClick={() => setActiveSection(sec.key)}
                whileHover={{ x: 3 }}
                transition={SPRING}
              >
                <span style={{ ...S.navDot, background: isActive ? "var(--accent)" : "var(--border-light)" }} />
                <span style={S.navLabel}>{sec.label}</span>
                <span style={{
                  ...S.navTag,
                  color:       isActive ? "var(--accent)"        : "var(--text-muted)",
                  borderColor: isActive ? "var(--accent-border)"  : "var(--border)",
                }}>
                  {sec.tag}
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* ── Download all — prominent sidebar CTA ─────────────────── */}
        <div style={S.dlAllWrap}>
          <div style={S.navGroupLabel}>EXPORT</div>
          <motion.button
            style={{
              ...S.dlAllBtn,
              background:  dlFlash ? "var(--success)" : "var(--accent)",
              borderColor: dlFlash ? "var(--success)" : "var(--accent)",
            }}
            onClick={handleDownloadAll}
            whileHover={{ y: -2, boxShadow: "var(--shadow-accent)" }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
          >
            {dlFlash ? <><CheckIcon /> Saved!</> : <><DownloadIcon /> Download All</>}
          </motion.button>
          <p style={S.dlAllHint}>
            Bundles blog, thread & email into one <code style={S.inlineCode}>.txt</code> file.
          </p>
        </div>

        <div style={S.sidebarFooter}>
          <button style={S.backBtn} onClick={() => navigate("/")}>
            ← New brief
          </button>
        </div>
      </motion.aside>

      {/* ── Main panel ───────────────────────────────────────────────── */}
      <main style={S.main}>

        {/* Header bar */}
        <motion.div
          style={S.contentHeader}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
        >
          <div style={S.contentMeta}>
            <span style={S.contentTag}>{currentMeta.tag}</span>
            <h1 style={S.contentTitle}>{currentMeta.label}</h1>
          </div>

          {/* Action button group */}
          <div style={S.actionGroup}>
            {/* Copy */}
            <motion.button
              style={{
                ...S.actionBtn,
                background: copied ? "var(--success)" : "var(--bg-elevated)",
                borderColor: copied ? "var(--success)" : "var(--border-mid)",
                color: copied ? "#000" : "var(--text-secondary)",
              }}
              onClick={handleCopy}
              whileHover={{ y: -2, boxShadow: "var(--shadow-hard)" }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING}
              title="Copy to clipboard"
            >
              {copied ? <><CheckIcon /> Copied!</> : <><ClipboardIcon /> Copy</>}
            </motion.button>

            {/* Download current section */}
            <motion.button
              style={{ ...S.actionBtn, ...S.actionBtnAccent }}
              onClick={handleDownloadCurrent}
              whileHover={{ y: -2, boxShadow: "var(--shadow-accent)" }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING}
              title={`Download ${currentMeta.label} as .txt`}
            >
              <DownloadIcon /> Download
            </motion.button>
          </div>
        </motion.div>

        {/* Divider */}
        <div style={S.divider} />

        {/* Content body */}
        <div style={S.contentBody}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SPRING}
              style={{ width: "100%" }}
            >
              {activeSection === "socialThread" ? (
                <SocialThreadView posts={final.socialThread} />
              ) : (
                <ProseView text={final[activeSection]} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ─── ProseView ─────────────────────────────────────────────────────── */
function ProseView({ text }) {
  return <div style={S.proseBlock}>{text}</div>;
}

/* ─── SocialThreadView ──────────────────────────────────────────────── */
function SocialThreadView({ posts }) {
  const safePosts = Array.isArray(posts) ? posts : [];

  return (
    <div style={S.threadList}>
      {safePosts.map((post, i) => (
        <motion.div
          key={i}
          style={S.threadPost}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING, delay: i * 0.05 }}
        >
          <div style={S.threadNum}>{String(i + 1).padStart(2, "0")}</div>
          <div style={S.threadText}>{post}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Icons ───────────────────────────────────────────────────────────── */
function ClipboardIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────── */
const S = {
  loading: {
    minHeight: "100svh", background: "var(--bg)", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 12,
    fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)",
  },
  loadingDot: {
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: "var(--accent)", animation: "pulse-dot 1.2s ease-in-out infinite",
  },
  loadingText: {},

  page: {
    minHeight: "100svh", display: "grid", gridTemplateColumns: "260px 1fr",
    background: "var(--bg)", position: "relative", zIndex: 1,
    fontFamily: "var(--font-body)",
  },

  /* Sidebar */
  sidebar: {
    borderRight: "1px solid var(--border)", background: "var(--bg-surface)",
    display: "flex", flexDirection: "column", padding: "28px 20px",
    gap: 28, minHeight: "100svh",
  },
  sidebarTop: { paddingBottom: 24, borderBottom: "1px solid var(--border)" },
  wordmark: {
    fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.04em", color: "var(--text-primary)",
  },
  wordmarkSub: {
    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em",
    color: "var(--text-muted)", marginTop: 2,
  },

  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navGroupLabel: {
    fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em",
    color: "var(--text-muted)", marginBottom: 8,
  },
  navItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    border: "1px solid", background: "transparent", cursor: "pointer",
    textAlign: "left", width: "100%",
    transition: "background 0.15s, border-color 0.15s, color 0.15s",
  },
  navDot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0, transition: "background 0.2s" },
  navLabel: { fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", flex: 1 },
  navTag: { fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.08em", padding: "2px 6px", border: "1px solid" },

  /* Download all block */
  dlAllWrap: { display: "flex", flexDirection: "column", gap: 10 },
  dlAllBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", padding: "12px 16px",
    border: "1px solid", cursor: "pointer",
    fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700,
    letterSpacing: "-0.01em", color: "#000",
    boxShadow: "var(--shadow-hard)", transition: "background 0.2s, border-color 0.2s",
  },
  dlAllHint: {
    fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, textAlign: "center",
  },
  inlineCode: {
    fontFamily: "var(--font-mono)", fontSize: 10,
    color: "var(--text-secondary)", background: "var(--bg-elevated)",
    padding: "1px 5px", border: "1px solid var(--border)",
  },

  sidebarFooter: { paddingTop: 20, borderTop: "1px solid var(--border)" },
  backBtn: {
    background: "transparent", border: "none", color: "var(--text-muted)",
    fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer",
    padding: 0, letterSpacing: "0.02em", transition: "color 0.15s",
  },

  /* Main */
  main: { display: "flex", flexDirection: "column", minHeight: "100svh", overflow: "hidden" },
  contentHeader: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    padding: "28px 40px 24px", flexShrink: 0,
  },
  contentMeta: { display: "flex", flexDirection: "column", gap: 6 },
  contentTag: { fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", color: "var(--accent)" },
  contentTitle: {
    fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 36px)",
    fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1.05,
  },

  /* Action button group */
  actionGroup: { display: "flex", gap: 8, alignItems: "center" },
  actionBtn: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "9px 16px", border: "1px solid",
    fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700,
    letterSpacing: "-0.01em", cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
    boxShadow: "var(--shadow-hard)",
    whiteSpace: "nowrap",
  },
  actionBtnAccent: {
    background: "var(--accent)", borderColor: "var(--accent)", color: "#000",
  },

  divider: { height: 1, background: "var(--border)", marginInline: 40, flexShrink: 0 },

  contentBody: {
    flex: 1, padding: "32px 40px 48px", overflowY: "auto",
    display: "flex", flexDirection: "column",
  },

  proseBlock: {
    fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.85,
    color: "var(--text-secondary)", whiteSpace: "pre-wrap", maxWidth: 720,
    padding: "28px 32px", border: "1px solid var(--border)",
    background: "var(--bg-surface)", boxShadow: "var(--shadow-hard)",
  },

  threadList: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 },
  threadPost: {
    display: "flex", gap: 20, padding: "20px 24px",
    border: "1px solid var(--border-mid)", background: "var(--bg-surface)",
    boxShadow: "var(--shadow-hard)", alignItems: "flex-start",
  },
  threadNum: {
    fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)",
    letterSpacing: "0.06em", flexShrink: 0, paddingTop: 2,
  },
  threadText: { fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)", whiteSpace: "pre-wrap" },
};