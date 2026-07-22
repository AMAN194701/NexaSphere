import { io, Socket } from 'socket.io-client';

/** Type-safe listener signature matching Socket.IO's internal contract. */
type SocketListener = (...args: unknown[]) => void;
import { getSocketServerUrl } from '../utils/runtimeConfig';

// Keep a singleton instance
let socketInstance: Socket | null = null;
let connectionUrl: string = '';

export const initializeSocket = (
  // Uses getSocketServerUrl() from runtimeConfig which correctly returns
  // empty string in production when unconfigured instead of falling back
  // to a hardcoded localhost URL that doesn't exist in deployed environments.
  url: string = getSocketServerUrl()
): Socket => {
  if (!socketInstance || (connectionUrl && connectionUrl !== url)) {
    if (socketInstance) {
      if (import.meta.env.DEV) {
        console.log(`[Socket.IO] Disconnecting existing socket due to URL change.`);
      }
      socketInstance.disconnect();
    }

    if (import.meta.env.DEV) {
      console.log(`[Socket.IO] Initializing new socket connection to: ${url}`);
    }
    connectionUrl = url;

    socketInstance = io(url, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    // Offline message queue implementation
    const originalEmit = socketInstance.emit.bind(socketInstance);
    let offlineQueue: any[][] = [];

    // Monkey-patch emit to queue messages when disconnected
    socketInstance.emit = function (event: string, ...args: any[]) {
      if (this.connected) {
        return originalEmit(event, ...args);
      } else {
        if (import.meta.env.DEV) {
          console.log(`[Socket.IO] Offline, queuing event: ${event}`);
        }
        offlineQueue.push([event, ...args]);
        return this;
      }
    };

    socketInstance.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log(`[Socket.IO] Connected with ID: ${socketInstance?.id}`);
      }

      // Flush offline queue upon reconnection
      if (offlineQueue.length > 0) {
        if (import.meta.env.DEV) {
          console.log(`[Socket.IO] Flushing ${offlineQueue.length} queued events`);
        }
        offlineQueue.forEach((args) => {
          originalEmit(args[0], ...args.slice(1));
        });
        offlineQueue = [];
      }
    });

    socketInstance.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log(`[Socket.IO] Disconnected. Reason: ${reason}`);
      }
    });

    // connect_error is always logged regardless of environment — it indicates
    // a real connectivity problem that should be visible in production logs.
    socketInstance.on('connect_error', (err) => {
      console.error(`[Socket.IO] Connection Error:`, err);
    });

    // Monkey-patch on/off for event listener observability — DEV only.
    // Restricted to DEV to avoid interfering with Socket.IO internals
    // and to prevent event names leaking into production logs.
    if (import.meta.env.DEV) {
      const originalOn = socketInstance.on.bind(socketInstance);
      socketInstance.on = (event: string, listener: SocketListener) => {
        if (event !== 'connect' && event !== 'disconnect') {
          console.log(`[Socket.IO] Listener registered for event: ${event}`);
        }
        return originalOn(event, listener);
      };

      const originalOff = socketInstance.off.bind(socketInstance);
      socketInstance.off = (event: string, listener?: SocketListener) => {
        if (event !== 'connect' && event !== 'disconnect') {
          console.log(`[Socket.IO] Listener removed for event: ${event}`);
        }
        return originalOff(event, listener);
      };
    }
  }

  return socketInstance;
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    return initializeSocket();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    if (import.meta.env.DEV) {
      console.log(`[Socket.IO] Manually destroying socket instance.`);
    }
    socketInstance.disconnect();
    socketInstance = null;
    connectionUrl = '';
  }
};
