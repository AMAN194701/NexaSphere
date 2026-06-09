/**
 * Socket.IO Client — delegates to unified TS singleton (src/services/socket.ts)
 * Kept for backward compatibility (consumed by AdminPage.jsx, useNotifications.js)
 */

import { captureHandledException } from "./errorTracking";
import { getSocketServerUrl } from "./runtimeConfig";
import {
  initializeSocket as tsInitSocket,
  getSocket as tsGetSocket,
  disconnectSocket as tsDisconnect,
} from "../services/socket";

let warnedMissingSocketConfig = false;

/**
 * Initialize Socket.IO client
 */
export function initializeSocket(serverUrl = getSocketServerUrl()) {
  const resolvedUrl = serverUrl || getSocketServerUrl();
  if (!resolvedUrl) {
    if (!warnedMissingSocketConfig) {
      warnedMissingSocketConfig = true;
      console.warn(
        "Socket.IO disabled: no socket server URL configured for this environment."
      );
    }
    return null;
  }

  const socket = tsInitSocket(resolvedUrl);

  // Register global lifecycle handlers once per socket lifetime
  if (!socket._jsClientReady) {
    socket._jsClientReady = true;

    socket.on("connect", () => identifyUser());

    socket.on("connect_error", (error) => {
      console.error("[Socket.IO] Connection Error:", error);
      captureHandledException(error, "Socket.IO connect_error:");
    });

    socket.on("error", (error) => {
      console.error("[Socket.IO] Error:", error);
      captureHandledException(error, "Socket.IO error:");
    });

    socket.on("reconnect_failed", () => {
      console.error("[Socket.IO] Reconnection failed after max attempts");
      captureHandledException(
        new Error("Socket.IO reconnect attempts exhausted"),
        "Socket.IO reconnect failed:"
      );
    });
  }

  return socket;
}

/**
 * Get socket instance
 */
export function getSocket() {
  return tsGetSocket();
}

/**
 * Identify user to server
 */
export function identifyUser(userId, email) {
  if (!userId || !email) {
    const storedUser = localStorage.getItem("ns_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userId = user.id || user.userId;
        email = user.email;
      } catch (e) {
        // ignore
      }
    }
  }

  const s = tsGetSocket();
  if (s && userId) {
    s.emit("user:identify", { userId, email });
  }
}

/**
 * Join notification room
 */
export function joinRoom(roomName) {
  const s = tsGetSocket();
  if (s) s.emit("room:join", roomName);
}

/**
 * Leave room
 */
export function leaveRoom(roomName) {
  const s = tsGetSocket();
  if (s) s.emit("room:leave", roomName);
}

/**
 * Register event handler
 */
export function on(eventName, handler) {
  const s = tsGetSocket();
  if (s) s.on(eventName, handler);
}

/**
 * Remove event handler
 */
export function off(eventName, handler) {
  const s = tsGetSocket();
  if (s) {
    if (handler) {
      s.off(eventName, handler);
    } else {
      s.off(eventName);
    }
  }
}

/**
 * Emit custom event to server
 */
export function emit(eventName, data) {
  const s = tsGetSocket();
  if (s) s.emit(eventName, data);
}

/**
 * Disconnect socket gracefully (Use mainly for testing or explicit manual disconnect)
 */
export function disconnect() {
  tsDisconnect();
}

/**
 * Completely destroy socket and all listeners (Use on user logout)
 */
export function destroySocket() {
  const s = tsGetSocket();
  if (s) {
    s.removeAllListeners();
    s.disconnect();
  }
  // Reset TS singleton so initializeSocket creates a fresh one
  tsDisconnect();
}

/**
 * Get socket status
 */
export function isConnected() {
  try {
    return tsGetSocket()?.connected || false;
  } catch {
    return false;
  }
}

/**
 * Get socket id
 */
export function getSocketId() {
  try {
    return tsGetSocket()?.id || null;
  } catch {
    return null;
  }
}

export default {
  initializeSocket,
  getSocket,
  identifyUser,
  joinRoom,
  leaveRoom,
  on,
  off,
  emit,
  disconnect,
  destroySocket,
  isConnected,
  getSocketId,
};
