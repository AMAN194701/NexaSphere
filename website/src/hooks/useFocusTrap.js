import { useEffect, useRef } from 'react';

export default function useFocusTrap(isActive, onClose) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Auto-focus first element when modal opens
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0 && !modalRef.current.contains(document.activeElement)) {
        focusableElements[0].focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onClose]);

  return modalRef;
}
