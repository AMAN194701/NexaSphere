import React from "react";

const LearningRoadmap = ({ roadmap }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Learning Roadmap
      </h2>

      <div className="space-y-3">
        {roadmap?.map((step, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-500 pl-4"
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningRoadmap;