import { Router } from 'express';
import hallRoutes from './hall.routes.js';
import alertRoutes from './alert.routes.js';
import mlRoutes from './ml.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/halls', hallRoutes);
router.use('/alerts', alertRoutes);
router.use('/ml', mlRoutes);

export default router; 