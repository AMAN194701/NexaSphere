// authUtils.js
// Token storage via sessionStorage is deprecated for admin auth.
// Admin authentication now uses secure HttpOnly cookies and server-side session validation.

import { jwtDecode } from 'jwt-decode';
let _logoutTimer = null;

/**
 * Client-side token persistence is deprecated; secure cookies are used instead.
 */
export function saveTokenAndScheduleLogout(token, logoutFn) {
  console.warn('[authUtils] Token storage is deprecated. Secure cookies are used instead.');
  scheduleAutoLogout(token, logoutFn);
}

/**
 * Decode the JWT and set a timer to call logoutFn ~30 s before expiry.
 */
export function scheduleAutoLogout(token, logoutFn) {
  clearAutoLogoutTimer();

  try {
    const { exp } = jwtDecode(token);
    if (!exp) return;

    const BUFFER_MS = 30_000;
    const msUntilExpiry = exp * 1000 - Date.now() - BUFFER_MS;

    if (msUntilExpiry <= 0) {
      logoutFn();
      return;
    }

    _logoutTimer = setTimeout(() => {
      logoutFn();
    }, msUntilExpiry);
  } catch (err) {
    console.error('[authUtils] Failed to decode JWT — logging out for safety.', err);
    logoutFn();
  }
}

/** Cancel a pending auto-logout timer. */
export function clearAutoLogoutTimer() {
  if (_logoutTimer !== null) {
    clearTimeout(_logoutTimer);
    _logoutTimer = null;
  }
}

/** Return the stored token, or null if absent. */
export function getToken() {
  return null;
}

/** Wipe the token from storage (no-op for secure cookies). */
export function removeToken() {}

/** Re-hydrate session state from secure cookies (no-op). */
export function rehydrateSession() {}
