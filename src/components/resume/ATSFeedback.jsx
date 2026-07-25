import React from "react";

const ATSFeedback = ({ suggestions }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        ATS Suggestions
      </h2>

      <ul className="space-y-3">
        {suggestions?.map((item, index) => (
          <li
            key={index}
            className="bg-blue-50 p-3 rounded-lg"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ATSFeedback;