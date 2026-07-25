/**
 * useSearch
 * === * Minimal client-side search hook used by SearchBar.
 *
 * Provides:
 *  - local filtering over provided `activities` and `events`
 *  - grouping of results by type
 *  - recent searches storage
 */

import { useState, useMemo, useCallback, useEffect } from 'react';

const RECENT_KEY = 'ns_recent_searches';

function safeLower(v) {
  return String(v || '').toLowerCase();
import { useState, useEffect, useCallback, useRef } from 'react';

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const it of arr) {
    const k = keyFn(it);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}

export function useSearch(activities = {}, events = []) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setRecentSearches(parsed);
    } catch {
      // ignore
export function getEventDisplayTitle(event) {
  return event?.title || event?.name || event?.shortName || '';
}

export function eventMatchesQuery(event, query) {
  return (
    matchesText(event?.title, query) ||
    matchesText(event?.name, query) ||
    matchesText(event?.shortName, query) ||
    matchesText(event?.description, query) ||
    matchesText(event?.category, query) ||
    matchesText(event?.location, query) ||
    event?.tags?.some?.((tag) => matchesText(tag, query))
  );
}

export function useSearch(activities, events, apiBase = '') {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const debouncedQuery = useDebounce(query, 300);
  const abortRef = useRef(null);

  const searchApi = useCallback(
    async (q, type) => {
      if (!apiBase) return null;
      try {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const params = new URLSearchParams({ q, type, limit: '50' });
        const res = await fetch(`${apiBase}/api/search?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) return null;
        return res.json();
      } catch (err) {
        if (err.name === 'AbortError') return null;
        return null;
      }
    },
    [apiBase]
  );

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      setApiError(null);
      return;
    }
  }, []);

  const persistRecent = useCallback((next) => {
    setRecentSearches(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const addRecentSearch = useCallback(
    (term) => {
      const t = String(term || '').trim();
      if (!t) return;
      persistRecent([t, ...recentSearches.filter((x) => x !== t)].slice(0, 8));
    },
    [persistRecent, recentSearches]
  );

  const removeRecentSearch = useCallback(
    (term) => {
      const t = String(term || '').trim();
      persistRecent(recentSearches.filter((x) => x !== t));
    },
    [persistRecent, recentSearches]
  );
    const q = debouncedQuery.toLowerCase();
    setLoading(true);

    const doSearch = async () => {
      const apiResults = await searchApi(debouncedQuery, filter === 'all' ? 'all' : filter);
      if (apiResults && apiResults.results) {
        setResults(apiResults.results);
        setLoading(false);
        return;
      }

      let all = [];

      if (filter === 'all' || filter === 'activities') {
        const actRes = Object.entries(activities || {})
          .filter(
            ([key, a]) =>
              matchesText(key, q) ||
              matchesText(a?.title, q) ||
              matchesText(a?.description, q) ||
              matchesText(a?.subtitle, q) ||
              matchesText(a?.tagline, q)
          )
          .map(([key, a]) => ({
            id: key,
            type: 'activity',
            title: a?.title || key,
            description: a?.description || a?.subtitle || a?.tagline || '',
            key,
          }));
        all = [...all, ...actRes];
      }

      if (filter === 'all' || filter === 'events') {
        const evRes = (events || [])
          .filter((ev) => eventMatchesQuery(ev, q))
          .map((ev) => {
            const title = getEventDisplayTitle(ev);
            return {
              id: ev.id || title,
              type: 'event',
              title,
              description: ev.description || ev.location || '',
              date: ev.date,
              tags: ev.tags,
              event: ev,
            };
          });
        all = [...all, ...evRes];
      }

      if (filter === 'all' || filter === 'members') {
        const base = apiBase || '';
        try {
          const res = await fetch(`${base}/api/content/team`);
          if (res.ok) {
            const data = await res.json();
            const members = data?.members || [];
            const matched = members
              .filter(
                (m) =>
                  matchesText(m.name, q) ||
                  matchesText(m.role, q) ||
                  matchesText(m.bio, q) ||
                  m.skills?.some((s) => matchesText(s, q))
              )
              .map((m) => ({
                id: m.id,
                type: 'member',
                title: m.name,
                description: m.role || m.bio || '',
                image: m.avatar || m.image,
              }));
            all = [...all, ...matched];
          }
        } catch {}
      }

      setResults(all);
      setLoading(false);
    };

    doSearch();
  }, [debouncedQuery, filter, activities, events, searchApi]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilter('all');
    setError(null);
  }, []);

  const baseResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    // Events
    for (const ev of events || []) {
      const hay = [ev.name, ev.shortName, ev.title].filter(Boolean).join(' ');
      if (safeLower(hay).includes(q)) {
        results.push({
          id: ev.id ?? ev.name ?? ev.shortName,
          type: 'event',
          title: ev.name || ev.title || ev.shortName || 'Event',
          description: ev.description || '',
          event: { id: ev.id ?? ev.name, name: ev.name || ev.title },
          key: ev.id ?? ev.name,
          url: `/events/${encodeURIComponent(ev.id ?? ev.name)}`,
        });
      }
    }

    // Activities + conducted events
    for (const act of Object.values(activities || {})) {
      const actKey = act.key || act.id || act.title || act.name;
      const actHay = [act.title, act.name, act.description].filter(Boolean).join(' ');
      if (safeLower(actHay).includes(q)) {
        results.push({
          id: actKey,
          type: 'activity',
          title: act.title || act.name,
          description: act.description || '',
          key: actKey,
          url: `/activities/${encodeURIComponent(actKey)}`,
        });
      }

      for (const cev of act.conductedEvents || []) {
        const hay2 = [cev.name, cev.shortName].filter(Boolean).join(' ');
        if (safeLower(hay2).includes(q)) {
          results.push({
            id: cev.id ?? cev.name ?? cev.shortName,
            type: 'event',
            title: cev.name || cev.shortName,
            description: cev.description || '',
            event: { id: cev.id ?? cev.name, name: cev.name || cev.shortName },
            key: cev.id ?? cev.name,
            url: `/events/${encodeURIComponent(cev.id ?? cev.name)}`,
          });
        }
      }
    }

    return uniqBy(results, (r) => `${r.type}::${r.id}`);
  }, [activities, events, query]);

  const filteredResults = useMemo(() => {
    if (filter === 'all') return baseResults;

    const allowed = new Set();
    if (filter === 'events') allowed.add('event');
    else if (filter === 'activities' || filter === 'members') allowed.add('activity');
    else if (filter === 'posts') allowed.add('post');
    else if (filter === 'resources') allowed.add('resource');
    else if (filter === 'users') allowed.add('user');

    return baseResults.filter((r) => allowed.has(r.type));
  }, [baseResults, filter]);

  const groupedResults = useMemo(() => {
    const groups = {};
    for (const r of filteredResults) {
      const gKey = r.type === 'event' ? 'event' : r.type === 'activity' ? 'activity' : r.type;
      if (!groups[gKey]) groups[gKey] = [];
      groups[gKey].push(r);
    }

    return {
      event: groups.event || [],
      activity: groups.activity || [],
    };
  }, [filteredResults]);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const t = setTimeout(() => {
      setLoading(false);
    }, 120);

    return () => clearTimeout(t);
  }, [query, filter]);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    results: filteredResults,
    groupedResults,
    loading,
    error,
    clearSearch,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
  };
    setResults([]);
    setApiError(null);
  }, []);

  return { query, setQuery, filter, setFilter, results, loading, apiError, clearSearch };
}
return { query, setQuery, filter, setFilter, results, loading, clearSearch, apiError };
