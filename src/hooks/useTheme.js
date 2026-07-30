import { useState, useEffect } from "react";

/* ================================
   CUSTOM HOOK — useTheme
================================ */
const useTheme = () => {

  /* --------------------------------
     1. INITIALIZE THEME
     Priority: localStorage → system preference → default "light"
  -------------------------------- */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("nexasphere-theme");
    if (saved) return saved;

    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemDark ? "dark" : "light";
  });

  /* --------------------------------
     2. APPLY THEME TO DOM
     Runs every time theme changes
  -------------------------------- */
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    localStorage.setItem("nexasphere-theme", theme);
  }, [theme]);

  /* --------------------------------
     3. WATCH SYSTEM PREFERENCE CHANGES
     e.g. user switches OS to dark mode
  -------------------------------- */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = (e) => {
      const savedTheme = localStorage.getItem("nexasphere-theme");
      if (!savedTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  /* --------------------------------
     4. TOGGLE & SETTERS
  -------------------------------- */
  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const setLight = () => setTheme("light");
  const setDark  = () => setTheme("dark");

  /* --------------------------------
     5. RETURN API
  -------------------------------- */
  return {
    theme,
    toggleTheme,
    setLight,
    setDark,
    isDark:  theme === "dark",
    isLight: theme === "light",
  };
};

export default useTheme;