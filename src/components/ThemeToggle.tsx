"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: "36px", height: "36px" }} />;
  }

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={18} />;
      case "dark":
        return <Moon size={18} />;
      default:
        return <Laptop size={18} />;
    }
  };

  const getTitle = () => {
    switch (theme) {
      case "light":
        return "Theme: Light (Click to switch to Dark)";
      case "dark":
        return "Theme: Dark (Click to switch to System)";
      default:
        return "Theme: System (Click to switch to Light)";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={getTitle()}
      aria-label="Toggle Theme"
      className="theme-toggle-btn"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        color: "var(--t1)",
        transition: "background-color 0.3s ease, transform 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.9)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
        }}
      >
        {getIcon()}
      </div>
    </button>
  );
};

export default ThemeToggle;
