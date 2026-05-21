// src/services/portfolioService.js

export const fetchPortfolios = async () => {
  try {
    const response = await fetch("/api/content/portfolios");

    if (!response.ok) {
      throw new Error("Failed to fetch portfolio data");
    }

    return await response.json();
  } catch (error) {
    console.error("Portfolio API Error:", error);

    return [
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

        skills: ["React", "Vite", "CSS", "FastAPI"],
      },
    ];
  }
};