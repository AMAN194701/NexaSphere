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

export const useAnalyticsData = () => {
  const { filters } = useAnalyticsFilters();
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionDataPoint[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setLoading(true);

    const months =
      (filters.dateRange.end.getFullYear() - filters.dateRange.start.getFullYear()) * 12 +
      (filters.dateRange.end.getMonth() - filters.dateRange.start.getMonth());
    const effectiveMonths = Math.max(1, months);

    const applyMockData = () => {
      if (!isMounted) return;
      setIsOffline(true);
      setTrendData(generateTrendData(filters.timeGranularity, effectiveMonths));
      setDistributionData(generateDistributionData(filters.categories));
      setComparisonData(generateComparisonData(filters.categories));
      setLoading(false);
    };

    if (!isApiConfigured()) {
      applyMockData();
      return () => {
        isMounted = false;
      };
    }

    const base = getApiBase();
    const token = localStorage.getItem('ns_student_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    (async () => {
      const results = await Promise.allSettled([
        apiClient(`${base}/api/admin/analytics/stats`, { headers, signal: controller.signal }),
        apiClient(`${base}/api/admin/analytics/growth`, { headers, signal: controller.signal }),
        apiClient(`${base}/api/admin/analytics/events`, { headers, signal: controller.signal }),
      ]);

      if (!isMounted) return;

      const [statsResult, growthResult, eventsResult] = results;
      const hasAnySuccess = results.some((result) => result.status === 'fulfilled');

      if (!hasAnySuccess) {
        applyMockData();
        return;
      }

      setIsOffline(false);

      // Map API responses to chart data shapes.
      // growth is expected to be an array of { name, users, activity, projects }
      if (growthResult.status === 'fulfilled' && Array.isArray(growthResult.value) && growthResult.value.length > 0) {
        setTrendData(growthResult.value as TrendDataPoint[]);
      } else {
        setTrendData(generateTrendData(filters.timeGranularity, effectiveMonths));
      }

      // events is expected to be an array of { name, value } category distribution
      if (eventsResult.status === 'fulfilled' && Array.isArray(eventsResult.value) && eventsResult.value.length > 0) {
        setDistributionData(eventsResult.value as DistributionDataPoint[]);
      } else {
        setDistributionData(generateDistributionData(filters.categories));
      }
      setComparisonData(generateComparisonData(filters.categories));

      // statsResult is currently used as a health check for the analytics API.
      // If it failed while the other endpoints succeeded, we still keep the
      // partial analytics view instead of dropping back to mock data.
      void statsResult;

      setLoading(false);
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [filters]);

  const overviewMetrics = useMemo(() => {
    if (trendData.length === 0)
      return { totalUsers: 0, totalActivity: 0, totalProjects: 0, userGrowth: 0 };

    const latest = trendData[trendData.length - 1];
    const previous = trendData.length > 1 ? trendData[trendData.length - 2] : null;

    const userGrowth =
      previous && previous.users > 0 ? ((latest.users - previous.users) / previous.users) * 100 : 0;

    return {
      totalUsers: latest.users,
      totalActivity: latest.activity,
      totalProjects: latest.projects,
      userGrowth: userGrowth.toFixed(1),
    };
  }, [trendData]);

  return {
    loading,
    isOffline,
    trendData,
    distributionData,
    comparisonData,
    overviewMetrics,
  };
};
