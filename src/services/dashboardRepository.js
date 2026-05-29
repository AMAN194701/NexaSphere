// src/services/dashboardRepository.js
// Data layer - NO MOCK DATA, only empty structures

// Storage keys
const STORAGE_KEYS = {
  METRICS: 'dashboard_metrics',
  ACTIVITIES: 'dashboard_activities',
  ACHIEVEMENTS: 'dashboard_achievements',
  WEEKLY: 'dashboard_weekly',
  PROFILE: 'dashboard_profile'
};

// Empty data structures (not mock data)
const EMPTY_DATA = {
  metrics: {
    totalPoints: 0,
    eventsAttended: 0,
    currentStreak: 0,
    contributions: 0,
    longestStreak: 0
  },
  activities: [],
  achievements: [],
  weeklyActivity: [
    { day: 'Mon', count: 0 }, { day: 'Tue', count: 0 }, { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 }, { day: 'Fri', count: 0 }, { day: 'Sat', count: 0 }, { day: 'Sun', count: 0 }
  ],
  profileCompletion: 0
};

import apiClient from '../utils/apiClient';

export const dashboardRepository = {
  // Get all dashboard data
  async getAll() {
    try {
      const userId = 'test-user-123'; // Using mock user ID as per implementation plan
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      const [profileData, questsData] = await Promise.all([
        apiClient(`${baseUrl}/api/dashboard/profile/${userId}`),
        apiClient(`${baseUrl}/api/dashboard/quests/${userId}`)
      ]);

      const activeQuests = questsData.filter(q => !q.completed);
      
      // Merge backend data with local storage structure
      return {
        metrics: {
          totalPoints: profileData.xp || 0,
          eventsAttended: this.getMetrics().eventsAttended,
          currentStreak: this.getMetrics().currentStreak,
          contributions: this.getMetrics().contributions,
          longestStreak: this.getMetrics().longestStreak
        },
        activities: this.getActivities(),
        achievements: profileData.badges ? profileData.badges.map((b, i) => ({ id: `b${i}`, title: b, date: new Date().toISOString() })) : this.getAchievements(),
        weeklyActivity: this.getWeeklyActivity(),
        profileCompletion: profileData.interests?.length ? 100 : this.getProfileCompletion()
      };
    } catch (error) {
      console.error('Failed to load dashboard data from API, falling back to local storage:', error);
      return {
        metrics: this.getMetrics(),
        activities: this.getActivities(),
        achievements: this.getAchievements(),
        weeklyActivity: this.getWeeklyActivity(),
        profileCompletion: this.getProfileCompletion()
      };
    }
  },

  getMetrics() {
    const stored = localStorage.getItem(STORAGE_KEYS.METRICS);
    return stored ? JSON.parse(stored) : EMPTY_DATA.metrics;
  },

  getActivities() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return stored ? JSON.parse(stored) : EMPTY_DATA.activities;
  },

  getAchievements() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return stored ? JSON.parse(stored) : EMPTY_DATA.achievements;
  },

  getWeeklyActivity() {
    const stored = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    return stored ? JSON.parse(stored) : EMPTY_DATA.weeklyActivity;
  },

  getProfileCompletion() {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return stored ? JSON.parse(stored) : EMPTY_DATA.profileCompletion;
  },

  // Save user actions (called when user performs activities)
  saveMetrics(data) {
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(data));
  },

  addActivity(activity) {
    const current = this.getActivities();
    const updated = [activity, ...current].slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
  },

  addAchievement(achievement) {
    const current = this.getAchievements();
    if (!current.find(a => a.id === achievement.id)) {
      const updated = [achievement, ...current];
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updated));
    }
  },

  updateWeeklyActivity(day, count) {
    const current = this.getWeeklyActivity();
    const updated = current.map(d => d.day === day ? { ...d, count: d.count + count } : d);
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(updated));
  },

  updateProfileCompletion(percentage) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(percentage));
  },

  // Clear all data (for testing)
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};