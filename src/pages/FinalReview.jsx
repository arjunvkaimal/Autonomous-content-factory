import useStore from "../store/pipelineStore";

export default function FinalReview() {
  const final = useStore((s) => s.final);

  if (!final) {
    return <div style={{ color: "white" }}>Loading...</div>;
  }

  return (
    <div style={{ color: "white", padding: "20px" }}>
      <h2>Blog</h2>
      <pre>{final.blog}</pre>

      <h2>Social Thread</h2>
      {final.socialThread.map((post, i) => (
        <p key={i}>{post}</p>
      ))}

      <h2>Email</h2>
      <p>{final.emailTeaser}</p>
    </div>
  );
}