import React from "react";

const SkillGapAnalysis = ({ skills }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Missing Skills
      </h2>

      <div className="flex flex-wrap gap-3">
        {skills?.map((skill, index) => (
          <span
            key={index}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillGapAnalysis;