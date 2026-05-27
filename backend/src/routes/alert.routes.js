import { Router } from 'express';
import { Alert } from '../models/alert.model.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const {
      hall,
      type,
      severity,
      startDate,
      endDate,
      resolved,
      limit = 50,
      page = 1,
    } = req.query;

    const query = {};
    
    if (hall) query.hall = hall;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (resolved !== undefined) query.resolved = resolved === 'true';
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .populate('hall', 'name location')
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Alert.countDocuments(query),
    ]);

    res.json({
      alerts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// Get a specific alert
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('hall', 'name location');
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    logger.error('Error fetching alert:', error);
    res.status(500).json({ message: 'Error fetching alert' });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  try {
    const { hallId, type, severity, description, metadata } = req.body;
    const alert = await Alert.createAlert(hallId, type, severity, description, metadata);
    res.status(201).json(alert);
  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({ message: 'Error creating alert' });
  }
});

// Resolve an alert
router.post('/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    await alert.resolve();
    res.json(alert);
  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({ message: 'Error resolving alert' });
  }
});

// Get alerts statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [total, unresolved, critical] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ resolved: false }),
      Alert.countDocuments({ severity: 'critical', resolved: false }),
    ]);

    const recentAlerts = await Alert.find({ resolved: false })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('hall', 'name');

    res.json({
      total,
      unresolved,
      critical,
      recentAlerts,
    });
  } catch (error) {
    logger.error('Error fetching alert statistics:', error);
    res.status(500).json({ message: 'Error fetching alert statistics' });
  }
});

export default router; 