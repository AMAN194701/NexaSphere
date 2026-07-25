import React, { useState, useEffect, useCallback } from 'react';
// src/hooks/useRecommendations.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { userInterestTracker } from '../services/recommendation/userInterestTracker';
import apiClient from '../utils/apiClient';
import { getApiBase } from '../utils/runtimeConfig';
import { recommendationEngine } from '../services/recommendation/recommendationEngine';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * useRecommendations hook
 *
 * Returns personalised event recommendations for the given userId.
 * Also exposes helpers for tracking interactions and saving preferences.
 */
export function useRecommendations(userId, { limit = 10, page = 1 } = {}) {
  const [recommendations, setRecommendations] = useState([]);
  const [source, setSource] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/recommendations?userId=${encodeURIComponent(userId)}&limit=${limit}&page=${page}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
      setSource(data.source);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('[useRecommendations] fetch error:', err);
      setError(err.message);
      // In a real application, the user_id would come from an authentication context.
      // For now, using a placeholder.
      const userId = '101'; // Example user ID

      const base = getApiBase();
      if (!base) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // The backend recommendation engine should ideally fetch all necessary user data
      // (interests, history, followed users, etc.) from the database based on the user_id.
      const response = await apiClient(`${base}/api/recommendations?user_id=${userId}`);
      if (response && response.recommendations) {
        setRecommendations(response.recommendations);
      } else if (response && Array.isArray(response)) {
        setRecommendations(response);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations from backend:', error);
      setRecommendations([]); // Fallback to empty recommendations on error
    } finally {
      setLoading(false);
    }
  }, [userId, limit, page]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const trackInteraction = useCallback(
    async (eventId, type) => {
      if (!userId) return;
      try {
        await fetch(`${API_BASE}/api/recommendations/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, eventId, type }),
        });
      } catch (err) {
        console.error('[useRecommendations] track error:', err);
  const trackEvent = useCallback((eventId, action, metadata) => {
    userInterestTracker.trackEventInteraction(eventId, action, metadata);
    // Ideally, this interaction should be sent to the backend for the ML model's feedback loop.
    // Example: axios.post(`${import.meta.env.VITE_API_BASE}/user-interactions`, { userId: '101', eventId, action, metadata });
  }, []);
  const trackEvent = useCallback(
    (eventId, action, metadata) => {
      userInterestTracker.trackEventInteraction(eventId, action, metadata);
      // generateRecommendations(); // Commented out / not defined in original
    },
    []
    // Ideally, this interaction should be sent to the backend for the ML model's feedback loop.
    // Example: apiClient(`${base}/api/user-interactions`, { method: 'POST', body: JSON.stringify({ userId: '101', eventId, action, metadata }) });
  );

  const getSimilarEvents = useCallback(
    (event, limit = 3) => {
      // This function for "similar events" could either remain client-side (if purely content-based)
      // or be moved to a backend endpoint (e.g., /api/events/{id}/similar) for ML-driven similarity.
      if (similarEvents[event.id]) {
        return similarEvents[event.id];
      }
      const similar = recommendationEngine.getSimilarEvents(event, eventsRef.current, limit); // Still uses client-side engine for similarity
      setSimilarEvents((prev) => ({ ...prev, [event.id]: similar }));
      return similar;
    },
    [userId]
  );

  const savePreferences = useCallback(
    async (interests, preferredDays = []) => {
      if (!userId) return;
      try {
        const res = await fetch(`${API_BASE}/api/recommendations/preferences/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interests, preferredDays }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchRecommendations(); // refresh after saving
      } catch (err) {
        console.error('[useRecommendations] savePreferences error:', err);
      }
    },
    [userId, fetchRecommendations]
    [fetchRecommendationsFromBackend]
    // Ideally, these preferences should be sent to the backend to update the user's profile for ML.
  );

  return {
    recommendations,
    source,
    total,
    loading,
    error,
    refresh: fetchRecommendations,
    trackInteraction,
    savePreferences,
  };
}

/**
 * useSimilarEvents hook
 */
export function useSimilarEvents(eventId, { limit = 6 } = {}) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/recommendations/similar/${encodeURIComponent(eventId)}?limit=${limit}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setSimilar(data.similar ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, limit]);

  return { similar, loading, error };
}

/**
 * useTrendingEvents hook
 */
export function useTrendingEvents({ limit = 10 } = {}) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/recommendations/trending?limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setTrending(data.trending ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { trending, loading, error };
}
