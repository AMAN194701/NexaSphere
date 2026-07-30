import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const domains = [
  "Web Development",
  "DSA",
  "AI/ML",
  "DBMS",
  "Operating Systems",
];

const difficulties = ["beginner", "intermediate", "advanced"];

const InterviewDashboard = () => {
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const startInterview = async () => {
    if (!domain) return setError("Please select a domain.");
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/interview/start",
        { domain, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/interview/quiz/${data.sessionId}`, {
        state: { questions: data.questions, sessionId: data.sessionId },
      });
    } catch (err) {
      setError("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl shadow-xl p-10 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-indigo-400">
          🎯 AI Mock Interview
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Select a domain and difficulty to begin
        </p>

        {/* Domain */}
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Domain
        </label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full mb-5 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Select Domain --</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Difficulty */}
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Difficulty
        </label>
        <div className="flex gap-3 mb-6">
          {difficulties.map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`flex-1 py-2 rounded-lg capitalize font-medium border transition ${
                difficulty === level
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-400"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={startInterview}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-semibold text-white transition disabled:opacity-50"
        >
          {loading ? "Starting..." : "🚀 Start Interview"}
        </button>
      </div>
    </div>
  );
};

export default InterviewDashboard;