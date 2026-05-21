export default function QuestionCard({ question, onAnswer }) {
  return (
    <div className="question-card">
      <p>{question?.text || 'Loading question...'}</p>
    </div>
  );
}