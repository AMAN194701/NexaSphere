import { describe, expect, it } from 'vitest';
import { getEstimatedWaitMinutes } from '../waitingRoomUtils.js';

describe('getEstimatedWaitMinutes', () => {
  it('returns null when queue position is missing', () => {
    expect(getEstimatedWaitMinutes(null)).toBeNull();
    expect(getEstimatedWaitMinutes(undefined)).toBeNull();
  });

  it('returns zero when the user is first in queue', () => {
    expect(getEstimatedWaitMinutes(0)).toBe(0);
  });

  it('rounds positive queue positions to a minimum of one minute', () => {
    expect(getEstimatedWaitMinutes(1)).toBe(2);
    expect(getEstimatedWaitMinutes(0.1)).toBe(1);
  });
});
