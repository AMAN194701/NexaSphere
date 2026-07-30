import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/offline/db';

export function useSyncEngine() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Elegant CSS-in-JS Toast Notification
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (typeof document === 'undefined') return;

    // Create container if not exists
    let container = document.getElementById('nexasphere-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'nexasphere-toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      });
      document.body.appendChild(container);
    }

    // Create toast card
    const toast = document.createElement('div');
    Object.assign(toast.style, {
      padding: '12px 20px',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.3s ease',
      transform: 'translateY(20px)',
      opacity: '0',
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });

    // Color theme based on type
    if (type === 'success') {
      toast.style.backgroundColor = 'rgba(16, 185, 129, 0.95)'; // Green
      toast.style.borderColor = 'rgba(16, 185, 129, 0.2)';
    } else if (type === 'error') {
      toast.style.backgroundColor = 'rgba(239, 68, 68, 0.95)'; // Red
      toast.style.borderColor = 'rgba(239, 68, 68, 0.2)';
    } else {
      toast.style.backgroundColor = 'rgba(30, 41, 59, 0.95)'; // Dark grey/blue
      toast.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }

    toast.innerText = message;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }, []);

  const flushQueue = useCallback(async () => {
    if (!navigator.onLine) {
      showToast('Cannot sync: connection is offline', 'error');
      return;
    }

    const queue = await db.syncQueue.toArray();
    if (queue.length === 0) {
      return;
    }

    setIsSyncing(true);
    showToast(`Syncing ${queue.length} pending changes...`, 'info');

    let successCount = 0;
    let failCount = 0;

    for (const item of queue) {
      try {
        let method = 'POST';
        if (item.action === 'UPDATE') method = 'PUT';
        if (item.action === 'DELETE') method = 'DELETE';

        // Direct sync endpoint or dynamic route path
        const url = `/api/${item.entity}`;
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.payload),
        });

        if (response.ok) {
          if (item.id !== undefined) {
            await db.syncQueue.delete(item.id);
          }
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Failed to sync item:', item, err);
        failCount++;
      }
    }

    setIsSyncing(false);

    if (successCount > 0) {
      showToast(`Successfully synced ${successCount} modifications!`, 'success');
    }
    if (failCount > 0) {
      showToast(`Failed to sync ${failCount} items. Will retry later.`, 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('App is back online! Starting background sync...', 'success');
      flushQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('App is offline. Actions will be queued locally.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial flush if online
    if (navigator.onLine) {
      flushQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushQueue, showToast]);

  return {
    isOnline,
    isSyncing,
    flushQueue,
    showToast,
  };
}
