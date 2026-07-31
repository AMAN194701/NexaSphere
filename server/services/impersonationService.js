const sessions = new Map();

const IMPERSONATION_TTL_MS = 30 * 60 * 1000;

function cleanupExpired() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - new Date(session.startedAt).getTime() > IMPERSONATION_TTL_MS) {
      sessions.delete(token);
    }
  }
}

// Run cleanup periodically every 10 minutes (unreferenced to allow clean Node process exit)
if (typeof setInterval === 'function') {
  const interval = setInterval(cleanupExpired, 10 * 60 * 1000);
  if (interval && typeof interval.unref === 'function') {
    interval.unref();
  }
}

export const impersonationService = {
  start(token, targetUser) {
    cleanupExpired();
    sessions.set(token, {
      targetUser,
      startedAt: new Date().toISOString(),
    });
  },

  stop(token) {
    sessions.delete(token);
  },

  getActive(token) {
    const session = sessions.get(token);
    if (!session) return null;
    if (Date.now() - new Date(session.startedAt).getTime() > IMPERSONATION_TTL_MS) {
      sessions.delete(token);
      return null;
    }
    return session;
  },
};
