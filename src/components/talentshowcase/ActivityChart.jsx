// src/components/TalentShowcase/ActivityChart.jsx

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", contributions: 20 },
  { month: "Feb", contributions: 45 },
  { month: "Mar", contributions: 38 },
  { month: "Apr", contributions: 60 },
  { month: "May", contributions: 75 },
];

const ActivityChart = () => {
  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Tooltip />
          <Line
            type="monotone"
            dataKey="contributions"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;