import React, { useState } from "react";
import axios from "axios";

const ResumeUpload = ({ setResult }) => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("Frontend Developer");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData
      );

      setResult(response.data);
    } catch (error) {
      console.log(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">
        AI Resume Analyzer
      </h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4 block w-full border p-2 rounded-lg"
      />

      <select
        className="w-full border p-3 rounded-lg mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option>Frontend Developer</option>
        <option>Backend Developer</option>
        <option>AI/ML Engineer</option>
        <option>Cybersecurity Analyst</option>
        <option>UI/UX Designer</option>
      </select>

      <button
        onClick={handleUpload}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl w-full"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </div>
  );
};

export default ResumeUpload;