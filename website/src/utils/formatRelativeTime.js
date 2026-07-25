/**
 * Formats a timestamp as a relative time string (e.g., "5m ago", "2h ago").
 *
 * @param {string|number|Date} timestamp - The timestamp to format.
 * @returns {string} A human-readable relative time string.
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp && timestamp !== 0) return 'Unknown time';

  let timeMs = timestamp;
  if (typeof timestamp === 'number' && timestamp > 0 && timestamp < 1e11) {
    timeMs = timestamp * 1000;
  }

  const date = new Date(timeMs);

  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return 'Unknown time';
  }

  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 0) {
    return '0w ago';
  }
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return `${Math.floor(diff / 604800)}w ago`;
}
