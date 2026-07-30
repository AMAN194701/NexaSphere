import logger from "../utils/logger.js";

/**
 * Consolidated into server/config/socket.js via _onConnection.
 * All event handlers (join_room, leave_room, task_status_update,
 * typing_start, typing_stop) are now registered in socket.js
 * to avoid duplicate registrations and guarantee unified payload shapes.
 */
export function registerRoomHandlers(_socket, _io) {
  logger.warn('roomHandler.js is deprecated — all handlers moved to server/config/socket.js');
}
