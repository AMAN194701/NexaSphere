export function getEstimatedWaitMinutes(pos) {
  if (pos === null || pos === undefined) return null;
  if (pos <= 0) return 0;
  return Math.max(1, Math.round(pos * 2));
}
