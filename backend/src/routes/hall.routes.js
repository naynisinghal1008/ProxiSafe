import express from 'express';
import { Hall } from '../models/hall.model.js';
import { Alert } from '../models/alert.model.js';
import { protect, authorize, checkHallAccess } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { ApiError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all halls
router.get('/',
  protect,
  asyncHandler(async (req, res) => {
    const halls = await Hall.find()
      .select('-__v')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: halls,
    });
  })
);

// Get single hall
router.get('/:id',
  protect,
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const hall = await Hall.findById(req.params.id)
      .select('-__v');

    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    res.json({
      success: true,
      data: hall,
    });
  })
);

// Create new hall (admin only)
router.post('/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      capacity,
      cameras,
      floorPlan,
      dimensions,
      thresholds,
    } = req.body;

    // Check if hall already exists
    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      throw new ApiError(400, 'Hall with this name already exists');
    }

    // Create hall
    const hall = await Hall.create({
      name,
      description,
      capacity,
      cameras,
      floorPlan,
      dimensions,
      thresholds,
    });

    // Log the action
    logger.info(`New hall created: ${hall.name}`, {
      action: 'hall_creation',
      hallId: hall._id,
      capacity: hall.capacity,
    });

    // Create system alert
    await Alert.create({
      type: 'system',
      severity: 'low',
      description: `New hall created: ${hall.name}`,
      metadata: {
        action: 'hall_creation',
        hallId: hall._id,
        capacity: hall.capacity,
      },
    });

    res.status(201).json({
      success: true,
      data: hall,
    });
  })
);

// Update hall
router.put('/:id',
  protect,
  authorize('admin'),
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      capacity,
      status,
      cameras,
      floorPlan,
      dimensions,
      thresholds,
    } = req.body;

    // Check if name is being changed and if it's already taken
    if (name) {
      const existingHall = await Hall.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingHall) {
        throw new ApiError(400, 'Hall with this name already exists');
      }
    }

    // Update hall
    const hall = await Hall.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        capacity,
        status,
        cameras,
        floorPlan,
        dimensions,
        thresholds,
      },
      { new: true, runValidators: true }
    );

    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    // Log the action
    logger.info(`Hall updated: ${hall.name}`, {
      action: 'hall_update',
      hallId: hall._id,
    });

    res.json({
      success: true,
      data: hall,
    });
  })
);

// Delete hall (admin only)
router.delete('/:id',
  protect,
  authorize('admin'),
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    // Create system alert before deletion
    await Alert.create({
      type: 'system',
      severity: 'medium',
      description: `Hall deleted: ${hall.name}`,
      metadata: {
        action: 'hall_deletion',
        hallId: hall._id,
        capacity: hall.capacity,
      },
    });

    // Log the action
    logger.info(`Hall deleted: ${hall.name}`, {
      action: 'hall_deletion',
      hallId: hall._id,
    });

    await hall.deleteOne();

    res.json({
      success: true,
      message: 'Hall deleted successfully',
    });
  })
);

// Update hall occupancy
router.patch('/:id/occupancy',
  protect,
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const { count } = req.body;

    if (typeof count !== 'number' || count < 0) {
      throw new ApiError(400, 'Invalid occupancy count');
    }

    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    // Update occupancy
    await hall.updateOccupancy(count);

    // Check if hall is overcrowded
    if (hall.isOvercrowded()) {
      await Alert.create({
        hall: hall._id,
        type: 'overcrowding',
        severity: 'high',
        description: `Hall ${hall.name} is overcrowded (${hall.currentOccupancy}/${hall.capacity})`,
        metadata: {
          currentOccupancy: hall.currentOccupancy,
          capacity: hall.capacity,
          percentage: hall.occupancyPercentage,
        },
      });
    }

    res.json({
      success: true,
      data: {
        currentOccupancy: hall.currentOccupancy,
        capacity: hall.capacity,
        occupancyPercentage: hall.occupancyPercentage,
      },
    });
  })
);

// Add camera to hall
router.post('/:id/cameras',
  protect,
  authorize('admin'),
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const { name, rtspUrl, position } = req.body;

    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    // Check if camera name already exists in this hall
    const existingCamera = hall.cameras.find(c => c.name === name);
    if (existingCamera) {
      throw new ApiError(400, 'Camera with this name already exists in this hall');
    }

    // Add camera
    hall.cameras.push({
      name,
      rtspUrl,
      position,
    });

    await hall.save();

    // Log the action
    logger.info(`Camera added to hall ${hall.name}: ${name}`, {
      action: 'camera_addition',
      hallId: hall._id,
      cameraName: name,
    });

    res.json({
      success: true,
      data: hall.cameras[hall.cameras.length - 1],
    });
  })
);

// Update camera
router.put('/:id/cameras/:cameraId',
  protect,
  authorize('admin'),
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const { name, rtspUrl, status, position } = req.body;

    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    // Find camera
    const camera = hall.cameras.id(req.params.cameraId);
    if (!camera) {
      throw new ApiError(404, 'Camera not found');
    }

    // Check if new name conflicts with other cameras
    if (name && name !== camera.name) {
      const nameExists = hall.cameras.some(c => c.name === name);
      if (nameExists) {
        throw new ApiError(400, 'Camera with this name already exists in this hall');
      }
    }

    // Update camera
    if (name) camera.name = name;
    if (rtspUrl) camera.rtspUrl = rtspUrl;
    if (status) camera.status = status;
    if (position) camera.position = position;

    await hall.save();

    // Log the action
    logger.info(`Camera updated in hall ${hall.name}: ${camera.name}`, {
      action: 'camera_update',
      hallId: hall._id,
      cameraId: camera._id,
    });

    res.json({
      success: true,
      data: camera,
    });
  })
);

// Delete camera
router.delete('/:id/cameras/:cameraId',
  protect,
  authorize('admin'),
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    const camera = hall.cameras.id(req.params.cameraId);
    if (!camera) {
      throw new ApiError(404, 'Camera not found');
    }

    // Log the action before deletion
    logger.info(`Camera deleted from hall ${hall.name}: ${camera.name}`, {
      action: 'camera_deletion',
      hallId: hall._id,
      cameraId: camera._id,
    });

    camera.deleteOne();
    await hall.save();

    res.json({
      success: true,
      message: 'Camera deleted successfully',
    });
  })
);

// Update hall status
router.post('/:id/status',
  protect,
  authorize('admin'),
  checkHallAccess,
  asyncHandler(async (req, res) => {
    const { count, violations } = req.body;
    const hall = await Hall.findById(req.params.id);
    
    if (!hall) {
      throw new ApiError(404, 'Hall not found');
    }

    await hall.updateStatus(count, violations);
    res.json(hall);
  })
);

export default router; 