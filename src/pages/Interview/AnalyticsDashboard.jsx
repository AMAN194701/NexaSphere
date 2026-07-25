import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, Legend
} from "recharts";

const AnalyticsDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, r] = await Promise.all([
          axios.get("http://localhost:5000/api/interview/sessions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/feedback/reports", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSessions(s.data.sessions || []);
        setReports(r.data.reports || []);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = sessions.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.totalScore,
    domain: s.domain,
  }));

  const latestReport = reports[0];
  const radarData = latestReport
    ? [
        { subject: "Technical", A: latestReport.overallScore * 0.7 },
        { subject: "Communication", A: latestReport.overallScore * 0.3 },
        { subject: "Speed", A: 60 },
        { subject: "Accuracy", A: latestReport.overallScore },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-8">
          📊 Performance Analytics
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Interviews", value: sessions.length },
            {
              label: "Avg Score",
              value: sessions.length
                ? Math.round(
                    sessions.reduce((a, b) => a + b.totalScore, 0) /
                      sessions.length
                  )
                : 0,
            },
            {
              label: "Best Score",
              value: sessions.length
                ? Math.max(...sessions.map((s) => s.totalScore))
                : 0,
            },
            {
              label: "Readiness",
              value: latestReport?.readinessLevel || "N/A",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900 rounded-xl p-5 border border-gray-700 text-center"
            >
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-indigo-300">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Score Over Time */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            📈 Score Progress
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ fill: "#6366F1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        {radarData.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">
              🕸️ Skill Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.4}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Latest Report */}
        {latestReport && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">
              🧠 Latest AI Feedback
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              {latestReport.aiFeedbackSummary}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-green-400 font-medium mb-2">✅ Strengths</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  {latestReport.strengths?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-red-400 font-medium mb-2">⚠️ Weaknesses</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  {latestReport.weaknesses?.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;