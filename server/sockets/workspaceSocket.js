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
const MAX_ROOMS_PER_SOCKET = 10;
const VALID_STATUSES = ['Todo', 'In_Progress', 'Review', 'Done'];

function isValidRoomId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9\-_]{1,100}$/.test(value);
}

//  RECTIFIED BLOCK 1: Safely calculates active rooms, accounting for uninitialized states
function roomsCount(socket) {
  if (!socket.rooms) return 0;
  
  // If the implicit private room (socket.id) is already in the Set, exclude it.
  // If it hasn't been added yet by Socket.io, the size represents only custom joined rooms.
  const hasPrivateRoom = socket.rooms.has(socket.id);
  return hasPrivateRoom ? socket.rooms.size - 1 : socket.rooms.size;
}

export function setupWorkspaceSocket(io) {
  io.on('connection', (socket) => {
    const handshakeRoomId = socket.handshake.auth?.roomId || socket.handshake.query?.roomId || null;

    //  RECTIFIED BLOCK 2: Safely validates room safety allocations before auto-joining
    if (handshakeRoomId && isValidRoomId(handshakeRoomId)) {
      const currentRooms = roomsCount(socket);
      
      // Ensure the socket hasn't already joined this room somehow, and sits under the cap
      const alreadyJoined = socket.rooms && socket.rooms.has(handshakeRoomId);
      
      if (!alreadyJoined && currentRooms < MAX_ROOMS_PER_SOCKET) {
        socket.join(handshakeRoomId);
        logger.info('Socket auto-joined room via handshake', {
          socketId: socket.id,
          roomId: handshakeRoomId,
        });
      }
    }

    //  RECTIFIED BLOCK: Fast-tracks existing members before validating capacity caps
    socket.on('join_room', (roomId, ack) => {
      if (!isValidRoomId(roomId)) {
        if (typeof ack === 'function') ack({ success: false, error: 'Invalid roomId' });
        return;
      }

      // 1. If already a member, immediately acknowledge success and exit
      if (socket.rooms && socket.rooms.has(roomId)) {
        if (typeof ack === 'function') ack({ success: true, roomId });
        return;
      }

      // 2. Safely apply capacity validation for brand new room entries
      if (roomsCount(socket) >= MAX_ROOMS_PER_SOCKET) {
        if (typeof ack === 'function') ack({ success: false, error: 'Room limit exceeded' });
        return;
      }

      socket.join(roomId);
      logger.info('Socket joined room', { socketId: socket.id, roomId });

      socket.to(roomId).emit('user_joined', {
        socketId: socket.id,
        timestamp: Date.now(),
      });

      if (typeof ack === 'function') ack({ success: true, roomId });
    });

    //  RECTIFIED BLOCK (leave_room)
    socket.on('leave_room', (roomId, ack) => {
      if (!isValidRoomId(roomId)) {
        if (typeof ack === 'function') ack({ success: false, error: 'Invalid roomId' });
        return;
      }

      // Security Check: Verify socket is actually in the room
      if (!socket.rooms || !socket.rooms.has(roomId)) {
        if (typeof ack === 'function') ack({ success: false, error: 'Unauthorized: Not a member of this room' });
        return;
      }

      socket.leave(roomId);
      logger.info('Socket left room', { socketId: socket.id, roomId });

      socket.to(roomId).emit('user_left', {
        socketId: socket.id,
        timestamp: Date.now(),
      });

      if (typeof ack === 'function') ack({ success: true, roomId });
    });

    //  RECTIFIED BLOCK (task_create)
    socket.on('task_create', async (data, ack) => {
      try {
        const { roomId, task } = data || {};

        if (!isValidRoomId(roomId)) {
          if (typeof ack === 'function') ack({ success: false, error: 'Invalid roomId' });
          return;
        }

        // Security Check: Verify socket is actually in the room
        if (!socket.rooms || !socket.rooms.has(roomId)) {
          if (typeof ack === 'function') ack({ success: false, error: 'Unauthorized: Not a member of this room' });
          return;
        }

        if (!task || !task.title) {
          if (typeof ack === 'function') ack({ success: false, error: 'Task title is required' });
          return;
        }

        const payload = {
          ...task,
          roomId,
          _id: task._id || undefined,
          createdAt: task.createdAt || new Date().toISOString(),
        };

        socket.to(roomId).emit('task_created', payload);

        if (typeof ack === 'function') ack({ success: true, task: payload });
      } catch (err) {
        logger.error('task_create error', {
          error: err.message,
          socketId: socket.id,
        });
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    //  RECTIFIED BLOCK (task_update_status)
    socket.on('task_update_status', async (data, ack) => {
      try {
        const { roomId, taskId, status, previousStatus, updatedBy } = data || {};

        if (!isValidRoomId(roomId)) {
          if (typeof ack === 'function') ack({ success: false, error: 'Invalid roomId' });
          return;
        }

        // Security Check: Verify socket is actually in the room
        if (!socket.rooms || !socket.rooms.has(roomId)) {
          if (typeof ack === 'function') ack({ success: false, error: 'Unauthorized: Not a member of this room' });
          return;
        }

        if (!taskId || !VALID_STATUSES.includes(status)) {
          if (typeof ack === 'function') {
            ack({
              success: false,
              error: 'taskId and valid status are required',
            });
          }
          return;
        }

        const payload = {
          taskId,
          roomId,
          status,
          previousStatus: previousStatus || null,
          updatedBy: updatedBy || null,
          timestamp: Date.now(),
        };

        socket.to(roomId).emit('task_updated', payload);

        if (typeof ack === 'function') ack({ success: true, task: payload });
      } catch (err) {
        logger.error('task_update_status error', {
          error: err.message,
          socketId: socket.id,
        });
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    //  RECTIFIED BLOCK (typing_start & typing_stop)
    socket.on('typing_start', (data) => {
      const { roomId, user } = data || {};
      if (!isValidRoomId(roomId) || !socket.rooms || !socket.rooms.has(roomId)) return;

      socket.to(roomId).emit('typing_start', {
        socketId: socket.id,
        user:
          user && typeof user === 'object'
            ? { name: String(user.name || 'Anonymous').slice(0, 100) }
            : { name: 'Anonymous' },
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data || {};
      if (!isValidRoomId(roomId) || !socket.rooms || !socket.rooms.has(roomId)) return;

      socket.to(roomId).emit('typing_stop', { socketId: socket.id });
    });

    socket.on('disconnecting', () => {
      if (socket.rooms) {
        socket.rooms.forEach((roomId) => {
          // Ignore the socket's private internal room matching its ID
    // FEATURE #3704: Clean up stale users from active room rosters on unexpected drop
    socket.on('disconnecting', (reason) => {
      if (socket.rooms) {
        for (const roomId of socket.rooms) {
          // Skip the socket's private room ID
          if (roomId !== socket.id) {
            socket.to(roomId).emit('user_left', {
              socketId: socket.id,
              timestamp: Date.now(),
            });
            logger.info('Broadcasted auto-departure on disconnect', { socketId: socket.id, roomId });
          }
        });
              reason: reason || 'disconnect',
            });
            
            logger.info('Broadcasted unexpected user_left on disconnect', {
              socketId: socket.id,
              roomId,
              reason,
            });
          }
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected from workspace handler', {
        socketId: socket.id,
      });
    });
  });
}
