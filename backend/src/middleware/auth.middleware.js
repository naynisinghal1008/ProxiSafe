import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from './error.middleware.js';
import { asyncHandler } from './error.middleware.js';
import rateLimit from 'express-rate-limit';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'User not found or inactive');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to perform this action');
    }
    next();
  };
};

// Optional authentication - doesn't require token but adds user if present
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
});

// Rate limiting for authentication attempts
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Check if user has access to specific hall
export const checkHallAccess = asyncHandler(async (req, res, next) => {
  const { hallId } = req.params;
  
  // Admin has access to all halls
  if (req.user.role === 'admin') {
    return next();
  }
  
  // For other roles, check if they have access to the hall
  // This could be implemented based on your access control requirements
  // For example, you might have a separate collection for hall permissions
  
  // For now, we'll allow all authenticated users to access halls
  // You can modify this based on your requirements
  next();
}); 