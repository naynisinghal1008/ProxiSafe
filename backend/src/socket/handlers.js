import { logger } from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
  // Store connected clients
  const connectedClients = new Map();

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join hall rooms for real-time updates
    socket.on('join_hall', (hallId) => {
      logger.info(`Client ${socket.id} joined hall: ${hallId}`);
      socket.join(`hall:${hallId}`);
      connectedClients.set(socket.id, { hallId });
    });

    // Leave hall room
    socket.on('leave_hall', (hallId) => {
      logger.info(`Client ${socket.id} left hall: ${hallId}`);
      socket.leave(`hall:${hallId}`);
      connectedClients.delete(socket.id);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      const clientData = connectedClients.get(socket.id);
      if (clientData && clientData.hallId) {
        socket.leave(`hall:${clientData.hallId}`);
      }
      connectedClients.delete(socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  // Attach io instance to app for use in routes
  io.app = io;

  return io;
}; 