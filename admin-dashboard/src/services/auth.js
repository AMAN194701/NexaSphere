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
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(OFFLINE_FLAG_KEY);
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
    try {
      const res = await fetch(`${API_BASE}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      // Network error during verification — treat as unauthenticated.
      return false;
    }
  },

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
  },
};
