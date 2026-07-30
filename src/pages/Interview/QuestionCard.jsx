const QuestionCard = ({ question }) => {
  if (!question) return null;

  const typeColor = {
    mcq: "bg-blue-900 text-blue-300",
    coding: "bg-purple-900 text-purple-300",
    descriptive: "bg-green-900 text-green-300",
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex justify-between items-center mb-3">
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium uppercase ${
            typeColor[question.type] || "bg-gray-700 text-gray-300"
          }`}
        >
          {question.type}
        </span>
        <span className="text-xs text-gray-500 capitalize">
          {question.difficulty}
        </span>
      </div>
      <p className="text-white text-lg leading-relaxed">{question.questionText}</p>

      {/* MCQ Options */}
      {question.type === "mcq" && question.options?.length > 0 && (
        <ul className="mt-4 space-y-2">
          {question.options.map((opt, i) => (
            <li
              key={i}
              className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 text-sm"
            >
              {String.fromCharCode(65 + i)}. {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionCard;