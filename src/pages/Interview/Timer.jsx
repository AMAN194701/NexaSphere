import { useEffect, useState } from "react";

const Timer = ({ duration = 120, onExpire }) => {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const isLow = seconds <= 30;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg border ${
        isLow
          ? "bg-red-900 border-red-500 text-red-300 animate-pulse"
          : "bg-gray-800 border-gray-700 text-gray-200"
      }`}
    >
      ⏱ {mins}:{secs}
    </div>
  );
};

export default Timer;