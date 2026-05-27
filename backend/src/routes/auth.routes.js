import express from 'express';
import { User } from '../models/user.model.js';
import { Alert } from '../models/alert.model.js';
import { protect, authorize, authRateLimit } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { ApiError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/register', 
  protect, 
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { username, email, password, role, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      firstName,
      lastName,
    });

    logger.info(`New user registered: ${user.username} (${user.role})`, {
      action: 'user_registration',
      userId: user._id,
      role: user.role,
    });

    await Alert.create({
      type: 'system',
      severity: 'low',
      description: `New user registered: ${user.username}`,
      metadata: {
        action: 'user_registration',
        userId: user._id,
        role: user.role,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  })
);

router.post('/login',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    const user = await User.findByCredentials(email, password);

    const token = user.generateAuthToken();

    logger.info(`User logged in: ${user.username}`, {
      action: 'user_login',
      userId: user._id,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          preferences: user.preferences,
        },
      },
    });
  })
);

router.get('/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
      },
    });
  })
);

router.put('/me',
  protect,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences,
      },
    });
  })
);

router.put('/change-password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Please provide current and new password');
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    logger.info(`User changed password: ${user.username}`, {
      action: 'password_change',
      userId: user._id,
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  })
);

// Request password reset
router.post('/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send reset email
    // For now, just log the token
    logger.info(`Password reset requested for: ${user.username}`, {
      action: 'password_reset_request',
      userId: user._id,
      resetToken,
    });

    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link',
    });
  })
);

// Reset password
router.post('/reset-password/:resetToken',
  asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log password reset
    logger.info(`User reset password: ${user.username}`, {
      action: 'password_reset',
      userId: user._id,
    });

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  })
);

export default router; 