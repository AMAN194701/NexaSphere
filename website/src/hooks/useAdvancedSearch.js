import { useState, useEffect } from 'react';

/**
 * Custom hook managing advanced search profiles and search history query trackers.
 * Wraps local storage token processing in a safe lazy initializer to avoid render crashes.
 */
export const useAdvancedSearch = () => {
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const storedData = localStorage.getItem('recent_searches');
      return storedData ? JSON.parse(storedData) : [];
    } catch (err) {
      console.error(
        'Failed to parse malformed JSON payload from recent_searches storage stream:',
        err
      );
      // Fallback cleanly to a structured baseline empty array if local parsing parameters fracture
      return [];
    }
  });

  const [searchFilters, setSearchFilters] = useState({
    query: '',
    category: 'all',
    dateRange: 'anytime',
  });

  // Persist healthy historical frames back into sync targets
  const saveSearchQuery = (newQuery) => {
    if (!newQuery || newQuery.trim() === '') return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== newQuery);
      const updated = [newQuery, ...filtered].slice(0, 10); // Clamp tracking trace length to 10 entries

      try {
        localStorage.setItem('recent_searches', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to commit search telemetry update back to local disk storage:', err);
      }

      return updated;
    });
  };

  return {
    recentSearches,
    searchFilters,
    setSearchFilters,
    saveSearchQuery,
  };
};

export default useAdvancedSearch;
