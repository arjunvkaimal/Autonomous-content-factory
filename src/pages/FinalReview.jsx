import useStore from "../store/pipelineStore";

export default function FinalReview() {
  const final = useStore((s) => s.final);

  if (!final) {
    return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
  }

  const blockStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "16px 20px",
    marginBottom: "24px",
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#e2e8f0",
  };

  const headingStyle = {
    color: "#a78bfa",
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  };

  return (
    <div style={{ color: "white", padding: "28px", maxWidth: "780px", margin: "0 auto" }}>
      <h1 style={{ color: "#f8fafc", marginBottom: "28px", fontSize: "22px" }}>
        Generated Content
      </h1>

      {/* Blog */}
      <div>
        <p style={headingStyle}>📝 Blog Post</p>
        <div style={blockStyle}>{final.blog}</div>
      </div>

      {/* Social Thread */}
      <div>
        <p style={headingStyle}>📢 Social Thread</p>
        <div style={{ ...blockStyle, display: "flex", flexDirection: "column", gap: "10px" }}>
          {final.socialThread.map((post, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                background: "rgba(167,139,250,0.08)",
                borderRadius: "8px",
                borderLeft: "3px solid #7c3aed",
                lineHeight: "1.5",
              }}
            >
              {post}
            </div>
          ))}
        </div>
      </div>

      {/* Email */}
      <div>
        <p style={headingStyle}>✉️ Email Teaser</p>
        <div style={blockStyle}>{final.emailTeaser}</div>
      </div>
    </div>
  );
}