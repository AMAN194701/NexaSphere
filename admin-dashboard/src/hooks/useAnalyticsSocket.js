import { useState, useEffect, useCallback } from 'react';
import { initAdminSocket, getSocket } from '../services/socketClient';

export function useAnalyticsSocket(eventId) {
  const [analytics, setAnalytics] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = initAdminSocket();
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onAnalyticsUpdate = (data) => {
      if (data.eventId === eventId) {
        setAnalytics(data);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('analytics:update', onAnalyticsUpdate);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('analytics:update', onAnalyticsUpdate);
    };
  }, [eventId]);

  return { analytics, connected };
}
