// src/components/TalentShowcase/StatBadge.jsx

import React from "react";
import "./StatBadge.css";

const StatBadge = ({ label, value }) => {
  return (
    <div className="stat-badge">
      <h4>{value}</h4>
      <p>{label}</p>
    </div>
  );
};

export default StatBadge;