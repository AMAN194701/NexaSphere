import React from "react";

const ResumeScoreCard = ({ score }) => {
  return (
    <div className="bg-green-100 p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-2">
        Resume Score
      </h2>

      <div className="text-5xl font-bold text-green-700">
        {score}/100
      </div>
    </div>
  );
};

export default ResumeScoreCard;