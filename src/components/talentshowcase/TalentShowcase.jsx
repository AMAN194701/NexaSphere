// src/components/TalentShowcase/TalentShowcase.jsx

import React, { useEffect, useState } from "react";
import PortfolioCard from "./PortfolioCard";
import "./TalentShowcase.css";

const TalentShowcase = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content/portfolios")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);

        // fallback mock data
        setMembers(mockData);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="showcase-loading">
        <h2>Loading Talent Showcase...</h2>
      </div>
    );
  }

  return (
    <section className="talent-showcase">
      <h1 className="showcase-title">Talent Showcase</h1>

      <div className="showcase-grid">
        {members.map((member, index) => (
          <PortfolioCard key={index} member={member} />
        ))}
      </div>
    </section>
  );
};

const mockData = [
  {
    name: "Mounika",
    role: "Frontend Developer",
    image:
      "https://avatars.githubusercontent.com/u/9919?v=4",
    github: {
      commits: 540,
      prs: 62,
      followers: 210,
    },
    leetcode: {
      rating: 1820,
      solved: 420,
      rank: "Knight",
    },
    skills: ["React", "Vite", "CSS", "API"],
  },
];

export default TalentShowcase;