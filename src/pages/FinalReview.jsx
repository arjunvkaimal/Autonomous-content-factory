import useStore from "../store/pipelineStore";

export default function FinalReview() {
  const final = useStore((state) => state.final);

  if (!final) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">

      <div>
        <h2>Blog</h2>
        <p>{final.blog}</p>
      </div>

      <div>
        <h2>Social Thread</h2>
        {final.socialThread.map((post, i) => (
          <p key={i}>{post}</p>
        ))}
      </div>

      <div>
        <h2>Email</h2>
        <p>{final.emailTeaser}</p>
      </div>

    </div>
  );
}