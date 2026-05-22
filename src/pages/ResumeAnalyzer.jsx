import React, { useState } from "react";

import ResumeUpload from "../components/resume/ResumeUpload";
import ResumeScoreCard from "../components/resume/ResumeScoreCard";
import SkillGapAnalysis from "../components/resume/SkillGapAnalysis";
import ATSFeedback from "../components/resume/ATSFeedback";
import LearningRoadmap from "../components/resume/LearningRoadmap";

const ResumeAnalyzer = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <ResumeUpload setResult={setResult} />

        {result && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <ResumeScoreCard score={85} />

            <SkillGapAnalysis
              skills={[
                "Docker",
                "TypeScript",
                "System Design",
              ]}
            />

            <ATSFeedback
              suggestions={[
                "Add measurable achievements",
                "Improve keyword optimization",
                "Use stronger action verbs",
              ]}
            />

            <LearningRoadmap
              roadmap={[
                "Learn Docker fundamentals",
                "Build TypeScript projects",
                "Practice system design interviews",
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;