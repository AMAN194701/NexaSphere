import { useState, useEffect } from 'react';
export default function Timer({ seconds = 60, onExpire }) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    if (t <= 0) { onExpire?.(); return; }
    const id = setTimeout(() => setT(t - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);
  return <div className="timer">{t}s</div>;
}
