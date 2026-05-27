import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    // Use local MongoDB if available, otherwise skip connection for testing
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proxisafe';
    
    // Try to connect to local MongoDB first
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn('MongoDB connection failed, running without database:', error.message);
    // Don't throw error, allow server to start without database for testing
    logger.info('Server will run in test mode without database');
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
}); 