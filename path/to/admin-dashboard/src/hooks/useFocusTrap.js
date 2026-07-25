/**
 * Hook to manage focus within a modal dialog.
 *
 * @returns {object} An object with `trapFocus` and `restoreFocus` methods.
 */
import { useState, useEffect } from 'react';
import { useRef } from 'react-dom';

const useFocusTrap = () => {
  const focusableElements = useRef([]);
  const [isTrapActive, setIsTrapActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isTrapActive) {
        restoreFocus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTrapActive]);

  const trapFocus = () => {
    setIsTrapActive(true);
    focusableElements.current = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    focusableElements.current.forEach((element) => {
      element.setAttribute('tabindex', '-1');
    });
    focusableElements.current[0].focus();
  };

  const restoreFocus = () => {
    setIsTrapActive(false);
    focusableElements.current.forEach((element) => {
      element.removeAttribute('tabindex');
    });
    const previousFocus = document.activeElement;
    previousFocus.focus();
  };

  return { trapFocus, restoreFocus };
};

export default useFocusTrap;