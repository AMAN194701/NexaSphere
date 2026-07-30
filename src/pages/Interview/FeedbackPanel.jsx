const FeedbackPanel = ({ feedback, score }) => {
  const scoreColor =
    score >= 8 ? "text-green-400" :
    score >= 5 ? "text-yellow-400" : "text-red-400";

  const scoreLabel =
    score >= 8 ? "Excellent!" :
    score >= 5 ? "Good effort" : "Needs improvement";

  return (
    <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-indigo-300 font-semibold text-lg">🤖 AI Feedback</h3>
        <div className="text-right">
          <span className={`text-2xl font-bold ${scoreColor}`}>
            {score}/10
          </span>
          <p className={`text-xs ${scoreColor}`}>{scoreLabel}</p>
        </div>
      </div>

      {/* Score Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all ${
            score >= 8 ? "bg-green-500" :
            score >= 5 ? "bg-yellow-500" : "bg-red-500"
          }`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>

      <p className="text-gray-300 text-sm leading-relaxed">{feedback}</p>
    </div>
  );
};

export default FeedbackPanel;