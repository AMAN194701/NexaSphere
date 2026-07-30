import { useEffect, useRef, useState } from "react";
import { DynamicIcon } from "../../shared/Icons";

function Counter({ value, suffix = "" }) {
import { useEffect, useRef, useState } from 'react';
import { DynamicIcon } from '../../shared/Icons';
import apiClient from '../../utils/apiClient.js';

/* ── Animated counter ── */
function Counter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = parseInt(value) || 0;
          const dur = 1200;
          const step = 16;
          const inc = num / (dur / step);
          let cur = 0;
          const timer = setInterval(() => {
            cur += inc;
            if (cur >= num) {
              setCount(num);
              clearInterval(timer);
            } else setCount(Math.floor(cur));
          }, step);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function GlitchText({ text, color }) {
  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      style={{ position: "relative", display: "inline-block" }}
      style={{ position: "relative", display: "inline-block", color }}
      style={{ position: 'relative', display: 'inline-block', color }}
      className="glitch-text"
      data-text={text}
    >
      {text}
    </span>
  );
}

function FloatingOrbs({ color }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        position: "absolute",
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            borderRadius: '50%',
            position: "absolute",
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            top: `${10 + ((i * 17) % 80)}%`,
            left: `${5 + ((i * 23) % 90)}%`,
            animation: `float ${6 + i * 2}s ease-in-out infinite`,
            animationDelay: `${-i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

function ScanLine({ color }) {
  return (
    <>
      <style>{`
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'scanline 4s linear infinite',
          position: "absolute",
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.3,
          pointerEvents: "none",
          zIndex: 0,
          animation: "scanline 4s linear infinite",
        }}
      />
    </>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.3,
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'scanline 4s linear infinite',
      }}
    />
  );
}

function EventCard({ event, activityColor, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect && onSelect(event)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, rgba(${hexToRgb(activityColor)},0.12), var(--bg-card))`
          : 'var(--bg-card)',
        border: `1px solid ${hovered ? activityColor + '80' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'none',
        boxShadow: hovered
          ? `0 20px 60px ${activityColor}30, 0 0 0 1px ${activityColor}40`
          : 'none',
        position: 'relative',
        overflow: 'hidden',
          : "var(--bg-card)",
        border: `1px solid ${hovered ? activityColor + "80" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "28px",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: hovered ? "translateY(-8px) scale(1.01)" : "none",
        boxShadow: hovered
          ? `0 20px 60px ${activityColor}30, 0 0 0 1px ${activityColor}40`
          : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '60%',
            height: '100%',
            background: `linear-gradient(105deg, transparent 20%, ${activityColor}15 50%, transparent 80%)`,
            animation: 'shimmer 0.6s ease forwards',
            pointerEvents: 'none',
            position: "absolute",
            top: 0,
            left: '-100%',
            width: '60%',
            height: '100%',
            background: `linear-gradient(105deg, transparent 20%, ${activityColor}15 50%, transparent 80%)`,
            animation: 'shimmer 0.6s ease forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              flexWrap: 'wrap',
            }}
          >
          <button
            className="btn btn-outline btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(event.id);
            }}
            style={{ marginBottom: '8px' }}
            style={{ marginBottom: "8px" }}
          >
            Delete this event
          </button>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              flexWrap: 'wrap',
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '0.95rem',
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: activityColor,
                margin: 0,
              }}
            >
              {event.name}
            </h3>
            {event.status === 'completed' && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  background: 'rgba(34,197,94,0.12)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.3)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
            {event.status === "completed" && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  background: 'rgba(34,197,94,0.12)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.3)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  flexShrink: 0,
                }}
              >
                <DynamicIcon name="CheckCircle" size={14} /> Completed
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>
          <div
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginBottom: '10px',
            }}
          >
            <DynamicIcon name="Calendar" size={14} /> {event.date}
            <DynamicIcon name="Calendar" size={14} /> {event.dateText ?? event.date}
          </div>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              margin: '0 0 12px',
              color: "var(--text-secondary)",
              fontSize: "0.88rem",
              margin: "0 0 12px",
              lineHeight: 1.6,
            }}
          >
            {event.tagline || event.description}
          </p>
          {event.stats && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {event.stats.map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '1rem',
                      fontFamily: "Orbitron, monospace",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: activityColor,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            className="btn btn-outline btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(event.id);
            }}
            style={{ marginTop: '12px' }}
            style={{ marginTop: "12px" }}
          >
            Delete this event
          </button>
        </div>
        <div
          style={{
            color: activityColor,
            fontSize: '1.4rem',
            flexShrink: 0,
            transform: hovered ? 'translateX(4px)' : '',
            transition: 'transform 0.3s ease',
            fontSize: "1.4rem",
            flexShrink: 0,
            transform: hovered ? 'translateX(4px)' : '',
            transition: 'transform 0.3s ease',
          }}
        >
          →
        </div>
      </div>
    </div>
  );
}

function UpcomingCard({ event, color }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        opacity: 0.75,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            animation: 'pulseRing 1.8s infinite',
        background: "var(--bg-card)",
        border: "1px dashed var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "20px 24px",
        opacity: 0.75,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            animation: 'pulseRing 1.8s infinite',
            flexShrink: 0,
          }}
        />
        <h4
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.85rem',
            fontFamily: "Orbitron, monospace",
            fontSize: "0.85rem",
            color,
            margin: 0,
            fontWeight: 700,
          }}
        >
          {event.name}
        </h4>
        <span
          style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: '20px',
            fontSize: "0.68rem",
            padding: "2px 8px",
            borderRadius: "20px",
            background: `${color}15`,
            color,
            border: `1px solid ${color}40`,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            flexShrink: 0,
          }}
        >
          <DynamicIcon name="Flame" size={14} /> Upcoming
        </span>
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '6px' }}>
        <DynamicIcon name="Calendar" size={14} /> {event.date}
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
      <div
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          marginBottom: '6px',
        }}
      >
        <DynamicIcon name="Calendar" size={14} /> {event.date}
      </div>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          margin: 0,
        }}
      >
        {event.description}
      </p>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default function ActivityDetailPage({ activity, onBack, onSelectEvent }) {
  const [mounted, setMounted] = useState(false);
  const [conductedEvents, setConductedEvents] = useState(activity.conductedEvents || []);
  const [upcomingEvents, setUpcomingEvents] = useState(activity.upcomingEvents || []);
  const [loading, setLoading] = useState(true);

  const apiBase = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
  const [manualEvents, setManualEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const apiBase = (import.meta?.env?.VITE_API_BASE || "").replace(/\/+$/, "");
  const activityKey = encodeURIComponent(activity.title);

  const fetchEvents = async () => {
  const [fetchState, setFetchState] = useState('idle'); // 'idle' | 'loading' | 'done' | 'error'
  const apiBase = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
  const activityKey = encodeURIComponent(activity.title);

  /* ── Fetch API-managed events with loading state ── */
  useEffect(() => {
    window.scrollTo({ top: 0 });
    // Slight delay so the mount animation is visible first
    const mountTimer = setTimeout(() => setMounted(true), 50);

    setFetchState('loading');
    const url = apiBase
      ? `${apiBase}/api/content/activity-events/${activityKey}`
      : `/api/content/activity-events/${activityKey}`;
    setLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data?.events)) {
        const events = data.events;
        const conducted = events.filter(
          (e) => e.status === 'completed' || e.status === 'conducted'
        );
        const upcoming = events.filter((e) => e.status === 'upcoming');

        setConductedEvents(conducted.length > 0 ? conducted : activity.conductedEvents || []);
        setUpcomingEvents(upcoming.length > 0 ? upcoming : activity.upcomingEvents || []);
      } else {
        setConductedEvents(activity.conductedEvents || []);
        setUpcomingEvents(activity.upcomingEvents || []);
      }
    } catch (e) {
      console.warn('Failed to fetch dynamic activity events, falling back to static data', e);
      setConductedEvents(activity.conductedEvents || []);
      setUpcomingEvents(activity.upcomingEvents || []);
    } finally {
      setLoading(false);
    }
  const fetchManualEvents = async () => {
    const url = apiBase
      ? `${apiBase}/api/content/activity-events/${activityKey}`
      : `/api/content/activity-events/${activityKey}`;
    const data = await apiClient(url).catch(() => ({}));
    if (Array.isArray(data?.events)) setManualEvents(data.events);
    setLoadingEvents(true);
    setEventsError(null);
    const url = apiBase
      ? `${apiBase}/api/content/activity-events/${activityKey}`
      : `/api/content/activity-events/${activityKey}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data?.events)) setManualEvents(data.events);
    } catch (err) {
      setEventsError(err.message);
    } finally {
      setLoadingEvents(false);
    }
  };
    apiClient(url)
      .then((data) => {
        if (Array.isArray(data?.events)) {
          setManualEvents(data.events);
        }
        setFetchState('done');
      })
      .catch(() => {
        // API unreachable — gracefully fall back to static data only
        setFetchState('error');
      });

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setTimeout(() => setMounted(true), 50);
    fetchEvents();

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('fired');
    fetchManualEvents();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !e.target.classList.contains('fired')) {
            e.target.classList.add('fired');
            e.target.addEventListener(
              'animationend',
              () => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'none';
              },
              { once: true }
            );
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -10px 0px' }
      { threshold: 0.09, rootMargin: '0px 0px -36px 0px' }
    );
    document
      .querySelectorAll(
        '#activity-detail-page .pop-in, #activity-detail-page .pop-left, #activity-detail-page .pop-right, #activity-detail-page .pop-word'
      { threshold: 0.09, rootMargin: "0px 0px -36px 0px" }
    );
    document
      .querySelectorAll(
        ".pop-in,.pop-left,.pop-right,.pop-scale,.pop-flip,.pop-word,.pop-num"
        '#activity-detail-page .pop-in, #activity-detail-page .pop-left, #activity-detail-page .pop-right, #activity-detail-page .pop-scale'
      )
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [activity.title]);

  const askAuth = () => {
    const name = window.prompt("Enter your full name (core team):");
    if (!name) return null;
    const email = window.prompt("Enter your email:");
    if (!email) return null;
    const phone = window.prompt("Enter your phone number:");
    if (!phone) return null;
    const password = window.prompt("Enter password:");
    if (!password) return null;
    return { name, email, phone, password };
  };

  const handleAddEvent = async () => {
    const auth = askAuth();
    if (!auth) return;
    const eventName = window.prompt("Event name:");
    if (!eventName) return;
    const eventDate = window.prompt("Event date (e.g. May 20, 2026):");
    if (!eventDate) return;
    const eventTagline = window.prompt("Short tagline (optional):") || "";
    const eventDescription = window.prompt("Event description:");
    if (!eventDescription) return;
    setBusy(true);
    try {
      const url = apiBase
        ? `${apiBase}/api/content/activity-events/${activityKey}`
        : `/api/content/activity-events/${activityKey}`;
      const data = await apiClient(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...auth,
          eventName,
          eventDate,
          eventTagline,
          eventDescription,
        }),
      });
      alert("Event added successfully.");
      await fetchManualEvents();
    } catch (e) {
      alert(e?.message || "Unable to add event.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const auth = askAuth();
    if (!auth) return;
    if (!window.confirm("Delete this event?")) return;
    setBusy(true);
    try {
      const url = apiBase
        ? `${apiBase}/api/content/activity-events/${activityKey}/${eventId}`
        : `/api/content/activity-events/${activityKey}/${eventId}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete event");
      alert("Event deleted.");
      await fetchManualEvents();
    } catch (e) {
      alert(e?.message || "Unable to delete event.");
    } finally {
      setBusy(false);
    }
  };

  const color = activity.color || "var(--cyan)";
  const rgb = color.startsWith("#") ? hexToRgb(color) : "0,212,255";
  const color = activity.color || 'var(--cyan)';
  const rgb = color.startsWith('#') ? hexToRgb(color) : '0,212,255';
  const allConducted = [...manualEvents, ...(activity.conductedEvents || [])];

  return (
    <div
      id="activity-detail-page"
      style={{ minHeight: '100vh', paddingBottom: '100px', overflow: 'hidden' }}
    >
    <div style={{ minHeight: '100vh', paddingBottom: '100px', overflow: 'hidden' }}>
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(180deg, rgba(${rgb},0.15) 0%, rgba(${rgb},0.06) 60%, transparent 100%)`,
          borderBottom: `1px solid rgba(${rgb},0.3)`,
          padding: '60px 0 52px',
          overflow: 'hidden',
      style={{ minHeight: "100vh", paddingBottom: "100px", overflow: "hidden" }}
    >
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(180deg, rgba(${rgb},0.15) 0%, rgba(${rgb},0.06) 60%, transparent 100%)`,
          borderBottom: `1px solid rgba(${rgb},0.3)`,
          padding: '60px 0 52px',
          overflow: 'hidden',
        }}
      >
        <FloatingOrbs color={color} />
        <ScanLine color={color} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: `1px solid rgba(${rgb},0.3)`,
              color: color,
              borderRadius: '20px',
              padding: '6px 18px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginBottom: '36px',
              transition: 'all 0.2s',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `rgba(${rgb},0.15)`;
              e.target.style.background = `rgba(${rgb},0.1)`;
              e.target.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.transform = '';
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <button
            onClick={onBack}
            style={{
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <button
            aria-label="Interactive element"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: `1px solid rgba(${rgb},0.3)`,
              color: color,
              borderRadius: '20px',
              padding: '6px 18px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginBottom: '36px',
              transition: 'all 0.2s',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `rgba(${rgb},0.1)`;
              e.target.style.transform = "translateX(-4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "none";
              e.target.style.transform = "";
              e.currentTarget.style.background = `rgba(${rgb},0.1)`;
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.transform = '';
            }}
          >
            ← Back to Activities
          </button>

          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)',
              transform: mounted ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div
              style={{
                fontSize: '5rem',
                marginBottom: '16px',
                filter: `drop-shadow(0 0 24px rgba(${rgb},0.6))`,
                animation: 'float 4s ease-in-out infinite',
                display: 'inline-block',
                fontSize: "5rem",
                marginBottom: "16px",
                filter: `drop-shadow(0 0 24px rgba(${rgb},0.6))`,
                animation: 'float 4s ease-in-out infinite',
                display: 'inline-block',
              }}
            >
              <DynamicIcon name={activity.icon} size={80} />
            </div>
            <h1
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                fontWeight: 900,
                marginBottom: '8px',
                fontFamily: "Orbitron, monospace",
                fontSize: "clamp(2rem, 6vw, 3.5rem)",
                fontWeight: 900,
                marginBottom: '8px',
                lineHeight: 1.1,
              }}
            >
              <GlitchText text={activity.title} color={color} />
            </h1>
            <div
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                color: `rgba(${rgb},0.8)`,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '20px',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.7s 0.2s ease',
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                color: `rgba(${rgb},0.8)`,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '20px',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.7s 0.2s ease',
              }}
            >
              {activity.tagline}
            </div>
            <p
              style={{
                color: 'var(--text-secondary)',
                maxWidth: '560px',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.7s 0.35s ease',
                color: "var(--text-secondary)",
                maxWidth: "560px",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.7s 0.35s ease',
              }}
            >
              {activity.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: `2.5px dashed rgba(${rgb},0.3)`,
                borderTopColor: color,
                animation: 'animate-spin 1s linear infinite',
              }}
            />
          </div>
        )}

        {!loading && conductedEvents.length > 0 && (
          <div style={{ marginBottom: '56px' }} className="pop-in">
      <div className="container" style={{ paddingTop: '56px' }}>
        {((activity.conductedEvents && activity.conductedEvents.length > 0) ||
          manualEvents.length > 0) && (
          <div style={{ marginBottom: '56px' }}>
            <h2
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color,
                marginBottom: '24px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
      <div className="container" style={{ paddingTop: "56px" }}>
      <div className="container" style={{ paddingTop: "32px" }}>
        {((activity.conductedEvents && activity.conductedEvents.length > 0) ||
          manualEvents.length > 0) && (
          <div style={{ marginBottom: "56px" }}>
      {/* ── Content area — reduced top padding to avoid double-gap ── */}
      <div className="container" style={{ paddingTop: '32px' }}>
        {/* Conducted Events */}
        {(allConducted.length > 0 || fetchState === 'loading') && (
          <div style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color,
                marginBottom: '24px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '32px',
                  height: '2px',
                  display: "inline-block",
                  width: "32px",
                  height: "2px",
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                }}
              />
              Conducted Events
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '760px' }}
            >
              {conductedEvents.map((event, i) => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleAddEvent} disabled={busy}>
                {busy ? 'Please wait...' : '+ Add Event'}
              </button>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '760px' }}
            >
              {[...manualEvents, ...(activity.conductedEvents || [])].map((event) => (
                <EventCard
                  key={event.id || i}
                  event={event}
                  activityColor={color}
                  onSelect={onSelectEvent}
                />
              ))}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "12px",
              }}
            >
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddEvent}
                disabled={busy}
              >
                {busy ? "Please wait..." : "+ Add Event"}
              </button>
            </div>
            {loadingEvents && (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  padding: "20px 0",

            {/* Loading state while API events are fetching */}
            {fetchState === 'loading' && manualEvents.length === 0 && (
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  padding: '12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Loading events...
              </div>
            )}
            {eventsError && (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  padding: "20px 0",
                }}
              >
                Could not load events from server. Showing cached data.
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxWidth: '760px',
              }}
            >
              {[...manualEvents, ...(activity.conductedEvents || [])].map(
                (event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    activityColor={color}
                    onSelect={onSelectEvent}
                    onDelete={handleDeleteEvent}
                  />
                )
              )}
              {allConducted.map((event) => (
                <div key={event.id} className="pop-in">
                  <EventCard event={event} activityColor={color} onSelect={onSelectEvent} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && upcomingEvents.length > 0 && (
          <div style={{ maxWidth: '760px' }} className="pop-in">
        {activity.upcomingEvents && activity.upcomingEvents.length > 0 && (
          <div style={{ maxWidth: '760px' }}>
            <h2
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color,
                marginBottom: '24px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
        {activity.upcomingEvents && activity.upcomingEvents.length > 0 && (
        {activity.upcomingEvents && activity.upcomingEvents.length > 0 && (
          <div style={{ maxWidth: '760px' }}>
            <h2
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color,
                marginBottom: '24px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '32px',
                  height: '2px',
                  display: "inline-block",
                  width: "32px",
                  height: "2px",
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                }}
              />
              Coming Up
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingEvents.map((event, i) => (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {activity.upcomingEvents.map((event, i) => (
                <UpcomingCard key={i} event={event} color={color} />
              ))}
            </div>
          </div>
        )}

        {!loading && conductedEvents.length === 0 && upcomingEvents.length === 0 && (
          <div
            style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px 0' }}
            className="pop-in"
          >
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{activity.icon}</div>
            <p>Events coming soon. Watch this space!</p>
          </div>
        )}
        {(!activity.conductedEvents || activity.conductedEvents.length === 0) &&
          (!manualEvents || manualEvents.length === 0) &&
          (!activity.upcomingEvents || activity.upcomingEvents.length === 0) && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{activity.icon}</div>
        {(!activity.conductedEvents || activity.conductedEvents.length === 0) &&
          (!manualEvents || manualEvents.length === 0) &&
          (!activity.upcomingEvents ||
            activity.upcomingEvents.length === 0) && (
        {/* Empty state */}
        {allConducted.length === 0 &&
          fetchState !== 'loading' &&
          (!activity.upcomingEvents || activity.upcomingEvents.length === 0) && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                padding: '80px 0',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{activity.icon}</div>
              <p>Events coming soon. Watch this space!</p>
            </div>
          )}
      </div>
    </div>
  );
}
