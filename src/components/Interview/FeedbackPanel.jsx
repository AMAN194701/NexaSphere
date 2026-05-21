export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;
  return <div className="feedback-panel">{feedback}</div>;
}