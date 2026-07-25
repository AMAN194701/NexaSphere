import logger from '../utils/logger.js';

/**
 * Consolidated into server/config/socket.js via _onConnection.
 * All event handlers (join_room, leave_room, task_create,
 * task_update_status, typing_start, typing_stop) are now
 * registered in socket.js to avoid duplicate registrations
 * and guarantee unified payload shapes.
 */
export function setupWorkspaceSocket(_io) {
  logger.warn('workspaceSocket.js is deprecated — all handlers moved to server/config/socket.js');
}
