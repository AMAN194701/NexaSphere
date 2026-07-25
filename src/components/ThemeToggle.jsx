import useTheme from "../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="transition-all duration-300 p-2 rounded-full
                 bg-gray-200 dark:bg-gray-700
                 hover:scale-110"
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
};

export default ThemeToggle;
