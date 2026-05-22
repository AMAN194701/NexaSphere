// src/components/TalentShowcase/PortfolioCard.jsx

import React from "react";
import ActivityChart from "./ActivityChart";
import StatBadge from "./StatBadge";
import "./PortfolioCard.css";

const PortfolioCard = ({ member }) => {
  return (
    <div className="portfolio-card">
      <img
        src={member.image}
        alt={member.name}
        className="profile-image"
      />

      <h2>{member.name}</h2>
      <p className="role">{member.role}</p>

      <div className="stats-container">
        <StatBadge label="Commits" value={member.github.commits} />
        <StatBadge label="PRs" value={member.github.prs} />
        <StatBadge label="Followers" value={member.github.followers} />
      </div>

      <div className="stats-container">
        <StatBadge label="Rating" value={member.leetcode.rating} />
        <StatBadge label="Solved" value={member.leetcode.solved} />
        <StatBadge label="Rank" value={member.leetcode.rank} />
      </div>

      <div className="skills">
        {member.skills.map((skill, i) => (
          <span key={i} className="skill-tag">
            {skill}
          </span>
        ))}
      </div>

      <ActivityChart />
    </div>
  );
};

export default PortfolioCard;