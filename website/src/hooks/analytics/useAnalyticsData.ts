import { useState, useEffect, useMemo } from 'react';
import { getApiBase } from '../../utils/runtimeConfig';
import apiClient from '../../utils/apiClient';
import { useAnalyticsFilters } from '../../context/AnalyticsFilterContext';
import {
  generateTrendData,
  generateDistributionData,
  generateComparisonData,
  TrendDataPoint,
  DistributionDataPoint,
  ComparisonDataPoint,
} from '../../utils/chartDataFormatters';

/**
 * Returns true when the API base URL is configured for this deployment.
 * Falls back to mock data when offline or unconfigured.
 */
const isApiConfigured = () => Boolean(getApiBase());
import { useState, useEffect } from 'react';
import { getApiBase } from '../../../runtimeConfig';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface AnalyticsDataState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}

export function useAnalyticsData(): AnalyticsDataState {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const base = getApiBase();
        const response = await fetch(`${base}/api/analytics`);

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
        }

        const json: AnalyticsData = await response.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const base = getApiBase();

    Promise.all([
      apiClient(`${base}/api/admin/analytics/stats`),
      apiClient(`${base}/api/admin/analytics/growth`),
      apiClient(`${base}/api/admin/analytics/events`),
    ])
      .then(([statsResult, growthResult, eventsResult]) => {
        if (!isMounted) return;
        if (import.meta.env.DEV) {
          if (statsResult.status === 'rejected') {
            console.warn('[useAnalyticsData] Stats fetch failed:', statsResult.reason?.message);
          }
          if (growthResult.status === 'rejected') {
            console.warn('[useAnalyticsData] Growth fetch failed:', growthResult.reason?.message);
          }
          if (eventsResult.status === 'rejected') {
            console.warn('[useAnalyticsData] Events fetch failed:', eventsResult.reason?.message);
          }
        }
        if (
          statsResult.status === 'rejected' &&
          growthResult.status === 'rejected' &&
          eventsResult.status === 'rejected'
        ) {
          applyMockData();
          return;
        }
        setIsOffline(false);
        const growth = growthResult.status === 'fulfilled' ? growthResult.value : null;
        const events = eventsResult.status === 'fulfilled' ? eventsResult.value : null;

        // Map API responses to chart data shapes.
        // growth is expected to be an array of { name, users, activity, projects }
        if (Array.isArray(growth) && growth.length > 0) {
          setTrendData(growth as TrendDataPoint[]);
        } else {
          setTrendData(generateTrendData(filters.timeGranularity, effectiveMonths));
        }

        // events is expected to be an array of { name, value } category distribution
        if (Array.isArray(events) && events.length > 0) {
          setDistributionData(events as DistributionDataPoint[]);
          setComparisonData(generateComparisonData(filters.categories));
        } else {
          setDistributionData(generateDistributionData(filters.categories));
          setComparisonData(generateComparisonData(filters.categories));
        }

        setLoading(false);
      })
      .catch(() => {
        if (isMounted) applyMockData();
      });
    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
