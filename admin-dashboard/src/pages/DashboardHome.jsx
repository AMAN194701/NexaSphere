import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Skeleton } from "../components/Skeleton";
import { AdminIcon } from "../components/AdminIcon";

export function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      api.events.getAll(),
      api.coreTeam.getAll(),
      api.membership.getAll(),
    ])
      .then(([eventsData, teamData, membershipData]) => {
        const events = eventsData?.events ?? [];
        const team = teamData?.members ?? teamData ?? [];
        const applications = membershipData?.responses ?? [];

        setStats({
          totalEvents: events.length,
          upcomingEvents: events.filter((e) => e.status === "upcoming").length,
          teamMembers: team.length,
          totalApplications: applications.length,
        });
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>
      {loading ? (
        <div className="stats-grid">
          <Skeleton height={100} count={3} />
        </div>
      ) : error ? (
        <div className="page-error">
          <p>
            Failed to load dashboard statistics. The server might be
            unreachable.
          </p>
          <button
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">
              <AdminIcon name="Calendar" size={28} />
            </span>
            <div>
              <div className="stat-value">{stats.totalEvents}</div>
              <div className="stat-label">Total Events</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">
              <AdminIcon name="Users" size={28} />
            </span>
            <div>
              <div className="stat-value">{stats.teamMembers}</div>
              <div className="stat-label">Core Team</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">
              <AdminIcon name="FileText" size={28} />
            </span>
            <div>
              <div className="stat-value">{stats.totalApplications}</div>
              <div className="stat-label">Applications</div>
            </div>
          </div>
        </div>
      )}
      <div className="quick-links">
        <h3>Quick Actions</h3>
        <div className="quick-grid">
          <a href="/dashboard/events" className="quick-card">
            <AdminIcon name="Calendar" size={18} /> Events
          </a>
          <a href="/dashboard/activity-events" className="quick-card">
            <AdminIcon name="Target" size={18} /> Activities
          </a>
          <a href="/dashboard/core-team" className="quick-card">
            <AdminIcon name="Users" size={18} /> Team
          </a>
          <a href="/dashboard/membership" className="quick-card">
            <AdminIcon name="FileText" size={18} /> Membership
          </a>
        </div>
      </div>
    </div>
  );
}
