const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
const TOKEN_KEY = 'ns_admin_token';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

let _email = null;
let _role = null;
let _scopes = [];

let refreshPromise = null;

let _email = null;
let _role = null;
let _scopes = [];
let _impersonatingUser = null;

let refreshPromise = null;
import { API_BASE_URL } from "../config";

export const adminLogin = async (email, password) => {
export const auth = {
  async login(username, password) {
    const cleanUsername = username.trim();
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanEmail, password: cleanPassword }),
      body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      body: JSON.stringify({ username: cleanEmail, email: cleanEmail, password: cleanPassword }),
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Invalid credentials');
    }

    const data = await res.json();

    if (data.requiresTwoFactor || data.requiresTwoFactorSetup) {
      return data;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(EMAIL_KEY, cleanUsername);
    // Persist the token so subsequent requests can use it
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.csrfToken) {
      localStorage.setItem("ns_csrf_token", data.csrfToken);
    }
    localStorage.setItem(EMAIL_KEY, cleanEmail);
    if (data.expiresAt) {
      localStorage.setItem(EXPIRY_KEY, data.expiresAt);
    }
    if (data.role) {
      localStorage.setItem('ns_admin_role', data.role);
    }
    if (data.scopes) {
      localStorage.setItem('ns_admin_scopes', JSON.stringify(data.scopes));
    }
    _email = cleanEmail;
    _role = data.role || null;
    _scopes = data.scopes || [];

    _email = cleanEmail;
    _role = data.role || null;
    _scopes = data.scopes || [];

    return data;
  },

  async verifyTwoFactor(challengeToken, code) {
    return finishTwoFactorRequest('/api/admin/2fa/verify', { challengeToken, code });
  },

  async verifyTwoFactorSetup(setupToken, code) {
    return finishTwoFactorRequest('/api/admin/2fa/setup/verify', { setupToken, code });
  },

  async logout() {
    fetch(`${API_BASE}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});

    _email = null;
    _role = null;
    _scopes = [];
    _impersonatingUser = null;
  },

  setImpersonating(user) {
    _impersonatingUser = user;
  },
  getImpersonating() {
    return _impersonatingUser;
  },
  clearImpersonating() {
    _impersonatingUser = null;
  },

  async refreshSession() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE}/api/admin/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        this.logout();
        throw new Error('Session refresh failed');
      }

      const data = await res.json();

      if (data.email) _email = data.email;
      if (data.role) _role = data.role;
      if (data.scopes) _scopes = data.scopes;

      return data;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
  const response = await fetch(
    `${API_BASE_URL}/api/admin/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  async verifySession() {
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const TOKEN_KEY = "ns_admin_token";
const EMAIL_KEY = "ns_admin_email";
const EXPIRY_KEY = "ns_admin_token_expiry";
const OFFLINE_FLAG_KEY = "ns_offline_mode";

/**
 * Generates a unique offline session token.
 * This token is only used locally and is never sent to a real backend.
 */
function generateMockToken() {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const auth = {
  /**
   * Attempts to log in via the live Java backend.
   * If the server is completely unreachable (network error) and the user
   * provides the designated mock credentials AND explicitly allows offline mode,
   * falls back to intentional offline mode so the admin dashboard remains
   * usable during development.
   */
  async login(email, password, allowOffline = false) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Invalid credentials");
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(EMAIL_KEY, cleanEmail);
      // Clear offline flag since we have a live session
      localStorage.removeItem(OFFLINE_FLAG_KEY);
      if (data.expiresAt) {
        localStorage.setItem(EXPIRY_KEY, data.expiresAt);
      }
      return data;
    } catch (err) {
      // Only fall back to offline mock if:
      // 1. It is a network error (server unreachable)
      // 2. User explicitly allowed offline fallback
      // 3. User provides the designated mock credentials
      const isNetworkError =
        err instanceof TypeError && err.message.toLowerCase().includes("fetch");

      if (
        isNetworkError &&
        allowOffline &&
        cleanEmail === "nexasphere@glbajajgroup.org" &&
        cleanPassword === "Admin@123"
      ) {
        if (import.meta.env.DEV) {
          console.warn(
            "[Auth] Java server unreachable — entering INTENTIONAL offline mock mode."
          );
        }
        const mockToken = generateMockToken();
        localStorage.setItem(TOKEN_KEY, mockToken);
        localStorage.setItem(EMAIL_KEY, cleanEmail);
        localStorage.setItem(OFFLINE_FLAG_KEY, "true");
        return { token: mockToken, email: cleanEmail, offline: true };
      }

      if (isNetworkError && !allowOffline) {
        throw new Error(
          'Server unreachable. Please check your connection or enable "Offline Mode" if you want to use the local mock database.'
        );
      }

      // Any other error (e.g. wrong credentials from live server) is rethrown
      throw err;
    }
  },

  async logout() {
    const token = this.getToken();
    // Fire-and-forget logout request to invalidate the server session.
    // We don't await it so the user is never blocked on a network failure.
    if (token && !this.isOfflineMode()) {
      fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("ns_csrf_token");
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(OFFLINE_FLAG_KEY);
    localStorage.removeItem('ns_admin_role');
    localStorage.removeItem('ns_admin_scopes');
  },

  /**
   * Verifies the current session token against the server.
   * Returns false if the token is missing, invalid, or the server is unreachable.
   */
  async verifySession() {
    const token = this.getToken();
    if (!token) return false;
    // Offline sessions are always considered valid locally.
    if (this.isOfflineMode()) return true;
    fetch(`${API_BASE}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});

    _email = null;
    _role = null;
    _scopes = [];
  },

  async refreshSession() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE}/api/admin/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        this.logout();
        throw new Error('Session refresh failed');
      }

      const data = await res.json();

      if (data.email) _email = data.email;
      if (data.role) _role = data.role;
      if (data.scopes) _scopes = data.scopes;

      return data;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  },

  async verifySession() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        try {
          await this.refreshSession();
          return true;
        } catch {
          return false;
        }
      }

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.email) _email = data.email;
        if (data.role) _role = data.role;
        if (data.scopes) _scopes = data.scopes;
      }

      return res.ok;
    } catch {
      // Network error during verification — treat as unauthenticated.
      return false;
    }
  },

  getEmail() {
    return _email;
  },

  getRole() {
    return _role || 'SuperAdmin';
  },

  getScopes() {
    return _scopes.length > 0
      ? _scopes
      : ['users:read', 'users:write', 'settings:admin', 'events:read', 'events:write'];
  },

  getRole() {
    return _role || 'SuperAdmin';
  },

  getScopes() {
    return _scopes.length > 0
      ? _scopes
      : ['users:read', 'users:write', 'settings:admin', 'events:read', 'events:write'];
  },

  isOffline() {
    return !import.meta.env.VITE_API_BASE;
  },

  isOfflineMode() {
    return this.isOffline();
  },
};

async function finishTwoFactorRequest(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Verification failed');
  }

  const data = await res.json();
  _email = data.email || data.username || null;
  _role = data.role || null;
  _scopes = data.scopes || [];
  return data;
}

export const adminSecurity = {
  async getOverview() {
    const res = await fetch(`${API_BASE}/api/admin/security`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unable to load security overview');
    return res.json();
  },

  async revokeSession(sessionId) {
    const res = await fetch(`${API_BASE}/api/admin/security/sessions/${sessionId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Unable to revoke session');
    }
    return res.json();
  },

  async logoutOtherSessions() {
    const res = await fetch(`${API_BASE}/api/admin/security/sessions/logout-others`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Unable to logout other sessions');
    return res.json();
  },

  async searchAuditLogs(query = '') {
    const res = await fetch(
      `${API_BASE}/api/admin/audit-logs?search=${encodeURIComponent(query)}`,
      {
        credentials: 'include',
      }
    );
    if (!res.ok) throw new Error('Unable to load audit trail');
    return res.json();
  },

  getAuditExportUrl(query = '') {
    return `${API_BASE}/api/admin/audit-logs/export?search=${encodeURIComponent(query)}`;
  },
};
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login Failed");
  }

  return data;
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  getEmail() {
    return localStorage.getItem(EMAIL_KEY);
  },

  /**
   * Returns true only when the admin is using an explicit offline/mock session.
   * This is set in localStorage during offline login fallback.
   */
  isOfflineMode() {
    return localStorage.getItem(OFFLINE_FLAG_KEY) === "true";
  },

  /**
   * Alias for isOfflineMode(), used by api.js guard.
   */
  isOffline() {
    return this.isOfflineMode();
    return localStorage.getItem(EMAIL_KEY);
  },
  isOffline() {
    return false;
  },
  isOfflineMode() {
    return false;
  },
};
