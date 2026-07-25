import { useState, useEffect } from 'react';
import Footer from '../../shared/Footer';
import { BannerOrbs } from '../../shared/MotionLayer';
import { DynamicIcon } from '../../shared/Icons';
import { gamificationService } from '../../services/gamification/gamificationService';
import SkeletonCard from '../../components/SkeletonCard';

export default function DashboardPage({ onBack }) {
  const [metrics, setMetrics] = useState({
    totalPoints: 0,
    eventsAttended: 0,
    currentStreak: 0,
    contributions: 0,
    longestStreak: 0,
  });
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 },
  ]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gamificationStats, setGamificationStats] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    loadDashboardData();
    loadGamificationData();

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('fired');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -10px 0px' }
    );

    document
      .querySelectorAll(
        '#dashboard-page .pop-in, #dashboard-page .pop-left, #dashboard-page .pop-right'
      )
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const loadDashboardData = () => {
    try {
      setLoading(true);

      const storedMetrics = localStorage.getItem('dashboard_metrics');
      const storedActivities = localStorage.getItem('dashboard_activities');
      const storedAchievements = localStorage.getItem('dashboard_achievements');
      const storedWeekly = localStorage.getItem('dashboard_weekly');

      if (storedMetrics) setMetrics(JSON.parse(storedMetrics));
      if (storedActivities) setActivities(JSON.parse(storedActivities));
      if (storedAchievements) setAchievements(JSON.parse(storedAchievements));
      if (storedWeekly) setWeeklyData(JSON.parse(storedWeekly));
    } catch (err) {
      setError('Failed to load dashboard data');
import React, { useState, useEffect } from "react";
import InterestSelector from "../../components/dashboard/InterestSelector";
import QuestTracker from "../../components/dashboard/QuestTracker";
import Leaderboard from "../../components/dashboard/Leaderboard";
import AiMentor from "../../components/dashboard/AiMentor";
import { buildUrl, getAiApiBase } from "../../utils/runtimeConfig";
function DashboardCardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        >
          <div
            style={{
              height: '16px',
              width: '60%',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              height: '12px',
              width: '40%',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
            }}
          />
        </div>
      ))}
    </div>
  );
}
import { DashboardCardSkeleton } from "../../components/ui/skeleton/DashboardCardSkeleton";
import { buildUrl, getAiApiBase } from "../../utils/runtimeConfig";

export default function DashboardPage({ onBack }) {
  // Mock current user for demonstration
  const [currentUser] = useState({ id: "user_123", name: "Explorer" });
  const [interests, setInterests] = useState([]);
  const [quests, setQuests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState(false);

  useEffect(() => {
    // In a real implementation, we would fetch this from Java Backend
    // Example: fetch(`/api/dashboard/quests/${currentUser.id}`)
    setQuests([
      {
        id: 'q1',
        title: 'Complete AI Review',
        description: 'Submit code to the AI Mentor.',
        id: "q1",
        title: "Complete AI Review",
        description: "Submit code to the AI Mentor.",
        xpReward: 100,
        completed: false,
      },
      {
        id: 'q2',
        title: 'Select Interests',
        description: 'Choose at least 3 tech interests.',
        id: "q2",
        title: "Select Interests",
        description: "Choose at least 3 tech interests.",
        xpReward: 50,
        completed: false,
      },
    ]);

    setLeaderboard(
      [
        {
          id: 'u1',
          userId: 'user_123',
          username: 'Explorer',
          id: "u1",
          userId: "user_123",
          username: "Explorer",
          xp: 450,
          level: 3,
        },
        {
          id: 'u2',
          userId: 'user_456',
          username: 'TechNinja',
          id: "u2",
          userId: "user_456",
          username: "TechNinja",
          xp: 850,
          level: 5,
        },
        {
          id: 'u3',
          userId: 'user_789',
          username: 'CodeMaster',
          id: "u3",
          userId: "user_789",
          username: "CodeMaster",
          xp: 320,
          level: 2,
        },
      ].sort((a, b) => b.xp - a.xp)
    );
  }, [currentUser]);

  const toggleInterest = (domain) => {
    setInterests((prev) => {
      const newInterests = prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain];

      // Quest trigger
      if (newInterests.length >= 3) {
        completeQuest("q2");
      }
      return newInterests;
    });
  };

  const completeQuest = (questId) => {
    setQuests((prev) => prev.map((q) => (q.id === questId ? { ...q, completed: true } : q)));
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );
  };

  const fetchRecommendations = async () => {
    if (interests.length === 0) return;
    setLoadingRecs(true);
    setRecsError(false);
    try {
      const recommendationsUrl = buildUrl(
        getAiApiBase(),
        `/recommend/events/${currentUser.id}`
      );
      const recommendationsUrl = buildUrl(getAiApiBase(), `/recommend/events/${currentUser.id}`);
      if (!recommendationsUrl) {
        throw new Error("Recommendations service is not configured");
      }

      const res = await fetch(recommendationsUrl);
      if (res.ok) {
        const data = await res.json();
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const data = await apiClient(`${base}/recommend/events/${currentUser.id}`);
      if (data) {
        setRecommendations(data.recommended_events || []);
      } else {
        setRecsError(true);
      }
    } catch (e) {
      setRecsError(true);
    } finally {
      // Simulate network latency so skeletons animate beautifully
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const loadGamificationData = () => {
    const stats = gamificationService.getUserStats();
    setGamificationStats(stats);
  };

  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  return (
    <div
      id="dashboard-page"
      style={{ minHeight: '100vh', paddingBottom: '100px', background: '#0A0A0A' }}
    >
      <div
        className="page-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(204,17,17,0.04), rgba(0,0,0,0))',
          borderBottom: '1px solid #1F1F1F',
          padding: '60px 0 50px',
          textAlign: 'center',
          marginBottom: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="page-banner-line"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #CC1111, #3B82F6, #8B5CF6)',
          }}
        />
        <BannerOrbs color="rgba(204,17,17,0.04)" />

        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '28px',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '100px',
            padding: '6px 16px',
            color: '#9CA3AF',
            fontSize: '.75rem',
            cursor: 'pointer',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 500,
          }}
        >
          ← Back
        </button>

        <span
          style={{
            color: '#CC1111',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          NexaSphere · GL Bajaj
        </span>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginBottom: '16px',
          }}
        >
          User Dashboard
        </h1>
        <p style={{ color: '#9CA3AF', maxWidth: '520px', margin: '0 auto' }}>
          Track your engagement, achievements, and activity across NexaSphere
        </p>
      </div>

      <div className="container">
        {error && (
          <div
            style={{
              background: 'rgba(204,17,17,0.1)',
              border: '1px solid #CC1111',
              borderRadius: '8px',
              padding: '12px 20px',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#CC1111', fontSize: '13px' }}>{error}</p>
            <button
              onClick={loadDashboardData}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#CC1111',
                marginTop: '8px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Gamification Stats Card */}
        {loading ? (
          <div
            style={{
              background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #2A2A2A',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div
                  className="ns-skeleton"
                  style={{
                    width: '100px',
                    height: '18px',
                    borderRadius: '4px',
                    marginBottom: '14px',
                  }}
                />
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <div>
                    <div
                      className="ns-skeleton"
                      style={{
                        width: '50px',
                        height: '11px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                      }}
                    />
                    <div
                      className="ns-skeleton"
                      style={{ width: '90px', height: '24px', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <div
                      className="ns-skeleton"
                      style={{
                        width: '50px',
                        height: '11px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                      }}
                    />
                    <div
                      className="ns-skeleton"
                      style={{ width: '60px', height: '24px', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <div
                      className="ns-skeleton"
                      style={{
                        width: '70px',
                        height: '11px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                      }}
                    />
                    <div
                      className="ns-skeleton"
                      style={{ width: '40px', height: '24px', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="ns-skeleton"
                style={{ width: '130px', height: '36px', borderRadius: '8px' }}
              />
            </div>
            <div style={{ marginTop: '20px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}
              >
                <div
                  className="ns-skeleton"
                  style={{ width: '120px', height: '11px', borderRadius: '4px' }}
                />
                <div
                  className="ns-skeleton"
                  style={{ width: '70px', height: '11px', borderRadius: '4px' }}
                />
              </div>
              <div
                className="ns-skeleton"
                style={{ width: '100%', height: '6px', borderRadius: '3px' }}
              />
            </div>
          </div>
        ) : gamificationStats ? (
          <div
            style={{
              background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #2A2A2A',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <h3
                  style={{
                    color: '#FFFFFF',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <DynamicIcon name="Trophy" size={20} /> Your Progress
                </h3>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px' }}>
                      Level {gamificationStats.level}
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>
                      {gamificationStats.title}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px' }}>Total XP</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#CC1111' }}>
                      {gamificationStats.xp}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px' }}>Badges Earned</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>
                      {gamificationStats.badges?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href="/gamification"
                style={{
                  padding: '8px 16px',
                  background: '#CC1111',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                View Full Stats →
              </a>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#6B7280',
                  marginBottom: '4px',
                }}
              >
                <span>Progress to Level {gamificationStats.level + 1}</span>
                <span>
                  {gamificationStats.xp} / {gamificationStats.nextLevelXP} XP
                </span>
              </div>
              <div
                style={{
                  background: '#2A2A2A',
                  borderRadius: '8px',
                  height: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(gamificationStats.xp / gamificationStats.nextLevelXP) * 100}%`,
                    background: '#CC1111',
                    height: '100%',
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} type="stat" />)
          ) : (
            <>
              <div
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '8px' }}>
                  Total Points
                </p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF' }}>
                  {metrics.totalPoints}
                </p>
              </div>
              <div
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '8px' }}>
                  Events Attended
                </p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF' }}>
                  {metrics.eventsAttended}
                </p>
              </div>
              <div
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '8px' }}>
                  Current Streak
                </p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF' }}>
                  {metrics.currentStreak} days
                </p>
                <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                  Best: {metrics.longestStreak} days
                </p>
              </div>
              <div
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '8px' }}>
                  Contributions
                </p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF' }}>
                  {metrics.contributions}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Weekly Activity Chart */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '48px',
          }}
        >
          <h2
            style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '24px' }}
          >
            Weekly Activity
          </h2>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    className="ns-skeleton"
                    style={{
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                      height: `${[40, 75, 120, 85, 140, 60, 100][idx % 7]}px`,
                    }}
                  />
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{day}</span>
                  <div
                    className="ns-skeleton"
                    style={{ width: '15px', height: '11px', borderRadius: '4px' }}
                  />
                </div>
              ))}
            </div>
          ) : weeklyData.every((d) => d.count === 0) ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: '#6B7280', marginBottom: '8px' }}>
                No activity data available yet.
              </p>
              <p style={{ color: '#4B5563', fontSize: '13px' }}>
                Participate in events and activities to see your engagement here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px' }}>
              {weeklyData.map((item, idx) => (
                <div
                  key={item.day}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      background: '#CC1111',
                      borderRadius: '4px 4px 0 0',
                      height: `${(item.count / maxCount) * 180}px`,
                      minHeight: '4px',
                      transition: 'height 0.5s',
                    }}
                  />
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{item.day}</span>
                  <span style={{ color: '#6B7280', fontSize: '11px' }}>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="dashboard-two-col">
          {/* Activity Timeline */}
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2A2A' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>
                Activity Timeline
              </h3>
              <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
                Your recent actions
              </p>
            </div>
            <div style={{ padding: !loading && activities.length === 0 ? '48px 24px' : '0' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} type="timeline-row" />
                ))
              ) : activities.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#6B7280', marginBottom: '8px' }}>No recent activity</p>
                  <p style={{ color: '#4B5563', fontSize: '12px' }}>
                    Your actions will appear here
                  </p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    style={{ padding: '16px 24px', borderBottom: '1px solid #2A2A2A' }}
                  >
                    <p style={{ fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                      {activity.title}
                    </p>
                    <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>
                      {activity.description}
                    </p>
                    <p style={{ color: '#6B7280', fontSize: '11px' }}>{activity.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements */}
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2A2A' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>
                Achievements
              </h3>
              <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>Badges earned</p>
            </div>
            <div style={{ padding: !loading && achievements.length === 0 ? '48px 24px' : '24px' }}>
              {loading ? (
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} type="achievement" />
                  ))}
                </div>
              ) : achievements.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#6B7280', marginBottom: '8px' }}>No achievements yet</p>
                  <p style={{ color: '#4B5563', fontSize: '12px' }}>
                    Participate in events to earn badges
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
                >
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      style={{
                        textAlign: 'center',
                        padding: '16px',
                        background: '#222222',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{ach.icon}</div>
                      <p style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px' }}>
                        {ach.title}
                      </p>
                      <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                        {ach.description}
                      </p>
                      <p style={{ color: '#CC1111', fontSize: '11px', marginTop: '8px' }}>
                        {ach.points} pts
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(204,17,17,0.05), transparent)',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '28px 32px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>
                Profile Completion
              </h3>
              <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
                Complete your profile to unlock more features
              </p>
            </div>
            <div style={{ flex: 1, maxWidth: '320px' }}>
              {loading ? (
                <>
                  <div
                    className="ns-skeleton"
                    style={{ width: '100%', height: '4px', borderRadius: '100px' }}
                  />
                  <div
                    className="ns-skeleton"
                    style={{
                      width: '50px',
                      height: '11px',
                      borderRadius: '4px',
                      marginTop: '6px',
                      float: 'right',
                    }}
                  />
                </>
              ) : (
                <>
                  <div
                    style={{
                      background: '#2A2A2A',
                      borderRadius: '100px',
                      height: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${profileCompletion}%`,
                        background: '#CC1111',
                        height: '100%',
                      }}
                    ></div>
      className="dashboard-page"
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        color: 'var(--t1)',
      className="dashboard-page"
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "var(--t1)",
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            background: 'linear-gradient(90deg, #fff, var(--c1))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: "clamp(2rem, 4vw, 3rem)",
            background: "linear-gradient(90deg, #fff, var(--c1))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome back, {currentUser.name}
        </h1>
        {onBack && (
          <button
            onClick={onBack}
            className="btn"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--b2)',
              color: 'var(--t1)',
              background: "var(--bg-glass)",
              border: "1px solid var(--b2)",
              color: "var(--t1)",
            }}
          >
            Home
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              background: 'var(--bg-glass)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--b2)',
            }}
          >
            <InterestSelector selectedInterests={interests} onToggleInterest={toggleInterest} />
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              background: "var(--bg-glass)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--b2)",
            }}
          >
            <InterestSelector
              selectedInterests={interests}
              onToggleInterest={toggleInterest}
            />
          </div>

          <div
            style={{
              background: 'var(--bg-glass)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--b2)',
            }}
          >
            <h3 style={{ marginBottom: '16px', color: 'var(--t1)' }}>
              Personalized Recommendations
            </h3>
            {interests.length === 0 ? (
              <p style={{ color: 'var(--t2)' }}>
              background: "var(--bg-glass)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--b2)",
            }}
          >
            <h3 style={{ marginBottom: "16px", color: "var(--t1)" }}>
              Personalized Recommendations
            </h3>
            {interests.length === 0 ? (
              <p style={{ color: "var(--t2)" }}>
                Select some interests above to see recommendations!
              </p>
            ) : loadingRecs ? (
              <DashboardCardSkeleton count={3} />
            ) : recsError ? (
              <p style={{ color: "var(--t2)" }}>
                Recommendations unavailable. Please try again later.
              </p>
            ) : recommendations.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--c1-50)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: 'var(--c1)' }}>
                      {rec.title || 'Event'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
                      padding: "12px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--c1-50)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "var(--c1)" }}>
                      {rec.title || "Event"}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--t2)" }}>
                      Match Score: {Math.round((rec.score || 0.8) * 100)}%
                    </div>
                  </div>
                  <p
                    style={{
                      textAlign: 'right',
                      fontSize: '11px',
                      color: '#4B5563',
                      marginTop: '6px',
                    }}
                  >
                    {profileCompletion}% Complete
                  </p>
                </>
              )}
            </div>
            {loading ? (
              <div
                className="ns-skeleton"
                style={{ width: '125px', height: '31px', borderRadius: '100px' }}
              />
            ) : (
              <button
                style={{
                  background: 'transparent',
                  border: '1px solid #CC1111',
                  color: '#CC1111',
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Complete Profile
              </button>
              <p style={{ color: "var(--t2)" }}>
              <p style={{ color: 'var(--t2)' }}>
              <p style={{ color: "var(--t2)" }}>
                No new recommendations based on your current interests.
              </p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => alert('Export functionality coming soon')}
            style={{
              background: '#CC1111',
              border: 'none',
              color: '#FFFFFF',
              padding: '10px 24px',
              borderRadius: '100px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Export Report
          </button>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <QuestTracker quests={quests} onCompleteQuest={completeQuest} />
          <Leaderboard users={leaderboard} currentUserId={currentUser.id} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AiMentor />
        </div>
      </div>

      <Footer />
    </div>
  );
}
