import { renderHook, waitFor } from '@testing-library/react';
import { useAnalyticsData } from './useAnalyticsData';
import { getApiBase } from '../../utils/runtimeConfig';
import { vi, describe, beforeEach, afterEach, it, expect, Mock } from 'vitest';

vi.mock('../../utils/runtimeConfig', () => ({
  getApiBase: vi.fn(),
}));

const mockedGetApiBase = getApiBase as Mock;

const mockAnalyticsData = {
  totalUsers: 1000,
  activeUsers: 200,
  pageViews: 5000,
  sessions: 800,
  bounceRate: 45.5,
  avgSessionDuration: 120,
};

describe('useAnalyticsData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetApiBase.mockReturnValue('https://api.example.com');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use getApiBase from runtimeConfig and not define its own local copy', () => {
    // Verify the hook calls the centralised getApiBase
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockAnalyticsData,
    } as Response);

    renderHook(() => useAnalyticsData());

    expect(mockedGetApiBase).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/api/analytics');
  });

  it('should return loading state initially', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAnalyticsData());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return data on successful fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockAnalyticsData,
    } as Response);

    const { result } = renderHook(() => useAnalyticsData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockAnalyticsData);
    expect(result.current.error).toBeNull();
  });

  it('should return error on failed fetch (non-ok response)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useAnalyticsData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed to fetch analytics: 500 Internal Server Error');
  });

  it('should return error when fetch throws a network error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useAnalyticsData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network failure');
  });

  it('should construct the URL using the base returned by getApiBase', async () => {
    mockedGetApiBase.mockReturnValue('https://custom-api.example.com');

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockAnalyticsData,
    } as Response);

    renderHook(() => useAnalyticsData());

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('https://custom-api.example.com/api/analytics');
    });
  });

  it('should handle empty base URL from getApiBase', async () => {
    mockedGetApiBase.mockReturnValue('');

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockAnalyticsData,
    } as Response);

    renderHook(() => useAnalyticsData());

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/analytics');
    });
  });

  it('should not update state after component unmounts', async () => {
    let resolveFetch!: (value: Response) => void;
    vi.spyOn(global, 'fetch').mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    const { result, unmount } = renderHook(() => useAnalyticsData());

    unmount();

    resolveFetch({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockAnalyticsData,
    } as Response);

    // Give microtasks time to flush
    await Promise.resolve();

    // State should remain at initial values since the hook was unmounted
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
