import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const defaultCode = {
  javascript: `// Write your solution here\nfunction solution() {\n  \n}`,
  python: `# Write your solution here\ndef solution():\n    pass`,
  java: `// Write your solution here\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}`,
};

const CodingEditor = ({ question, sessionId, questionId, onSubmit }) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultCode["javascript"]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
  };

  const submitCode = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/interview/submit-answer",
        { sessionId, questionId, answerText: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback({ text: data.feedback, score: data.score });
      if (onSubmit) onSubmit(data.score);
    } catch {
      setFeedback({ text: "Submission failed. Try again.", score: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col px-4 py-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Question */}
        <div className="bg-gray-900 rounded-xl p-5 mb-4 border border-gray-700">
          <h2 className="text-lg font-semibold text-indigo-300 mb-2">
            📝 Problem
          </h2>
          <p className="text-gray-300">{question || "No question provided."}</p>
        </div>

        {/* Language Selector */}
        <div className="flex gap-3 mb-3">
          {["javascript", "python", "java"].map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize border transition ${
                language === lang
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-400"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Monaco Editor */}
        <div className="rounded-xl overflow-hidden border border-gray-700 mb-4">
          <Editor
            height="400px"
            language={language}
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={submitCode}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Submitting..." : "🚀 Submit Code"}
        </button>

        {/* Feedback */}
        {feedback && (
          <div className="mt-5 bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-indigo-300 font-semibold">AI Feedback</h3>
              <span className="text-white font-bold text-lg">
                Score: {feedback.score}/10
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {feedback.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingEditor;