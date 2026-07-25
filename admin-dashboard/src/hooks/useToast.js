import { useCallback } from 'react';
import { eventEmitter, EVENTS } from '../services/eventEmitter';

export function useToast() {
  const showToast = useCallback((message, type = 'info') => {
    eventEmitter.emit(EVENTS.NOTIFY, { type, message });
  }, []);

  return { showToast };
import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return { showToast, toasts };
}
