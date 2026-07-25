import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import QuestionCard from "../../components/Interview/QuestionCard";
import Timer from "../../components/Interview/Timer";
import FeedbackPanel from "../../components/Interview/FeedbackPanel";

const QuizInterface = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { questions, sessionId } = state || {};

  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [allScores, setAllScores] = useState([]);

  const token = localStorage.getItem("token");

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/interview/submit-answer",
        {
          sessionId,
          questionId: questions[current]._id,
          answerText: answer,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback({ text: data.feedback, score: data.score });
      setAllScores((prev) => [...prev, data.score]);
    } catch {
      setFeedback({ text: "Failed to evaluate. Try again.", score: 0 });
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setAnswer("");
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/interview/complete/${sessionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompleted(true);
    } catch {
      setCompleted(true);
    }
  };

  if (!questions) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p>No session found. <a href="/interview" className="text-indigo-400 underline">Go back</a></p>
      </div>
    );
  }

  if (completed) {
    const total = allScores.reduce((a, b) => a + b, 0);
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
        <div className="bg-gray-900 rounded-2xl p-10 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-indigo-400 mb-4">
            🎉 Interview Complete!
          </h2>
          <p className="text-gray-300 text-lg mb-2">
            Total Score:{" "}
            <span className="text-white font-bold text-2xl">{total}</span>
            <span className="text-gray-500"> / {questions.length * 10}</span>
          </p>
          <button
            onClick={() => navigate("/interview/analytics")}
            className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold"
          >
            📊 View Analytics
          </button>
          <button
            onClick={() => navigate("/interview")}
            className="mt-3 w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
          >
            🔄 Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400 text-sm">
            Question {current + 1} of {questions.length}
          </span>
          <Timer duration={120} onExpire={submitAnswer} />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <QuestionCard question={questions[current]} />

        {/* Answer Input */}
        {!feedback && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              placeholder="Type your answer here..."
              className="w-full mt-6 p-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button
              onClick={submitAnswer}
              disabled={loading || !answer.trim()}
              className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Evaluating..." : "✅ Submit Answer"}
            </button>
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <>
            <FeedbackPanel feedback={feedback.text} score={feedback.score} />
            <button
              onClick={nextQuestion}
              className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
            >
              {current + 1 < questions.length ? "➡️ Next Question" : "🏁 Finish Interview"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;