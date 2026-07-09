import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useFocusTrap from './useFocusTrap';

describe('useFocusTrap hook', () => {
  it('traps focus within the modal', () => {
    const { result } = renderHook(() => useFocusTrap());
    const { trapFocus, restoreFocus } = result.current;
    trapFocus();
    expect(document.activeElement).toBe(document.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  });

  it('restores focus to previous element when trap is deactivated', () => {
    const previousFocus = document.createElement('div');
    previousFocus.focus();
    const { result } = renderHook(() => useFocusTrap());
    const { trapFocus, restoreFocus } = result.current;
    trapFocus();
    restoreFocus();
    expect(document.activeElement).toBe(previousFocus);
  });
});