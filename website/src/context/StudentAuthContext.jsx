import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { useTheme } from '../hooks/useTheme';

export const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (token) => {
    try {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;
      const data = await apiClient('/api/auth/me', options);
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      params.delete('token');
      const cleanUrl =
        window.location.pathname +
        (params.toString() ? '?' + params.toString() : '') +
        window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
      fetchMe(urlToken).finally(() => setLoading(false));
      return;
    }

    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback((provider) => {
    window.location.href = `/api/auth/${provider}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const { setTheme } = useTheme();

  useEffect(() => {
    if (user && user.theme) {
      setTheme(user.theme);
    }
  }, [user, setTheme]);

  const value = { user, loading, login, logout, isAuthenticated: !!user };

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return ctx;
}
