import { Router } from 'express';
import { Hall } from '../models/hall.model.js';
import { Alert } from '../models/alert.model.js';
import { logger } from '../utils/logger.js';
import { mlService } from '../services/mlService.js';
import { spawn } from 'child_process';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

const router = Router();

// Configure multer for video upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Not a video file!'), false);
        }
    }
});

// Store active processing jobs
const activeJobs = new Map();

// Start monitoring a hall
router.post('/start-monitoring/:hallId', async (req, res) => {
    try {
        const { hallId } = req.params;
        const { cameraUrl } = req.body;

        const hall = await Hall.findById(hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        // Get socket.io instance from req.app
        const io = req.app.get('socketio');
        
        await mlService.startMonitoring(hallId, cameraUrl, io);

        // Update hall status to active
        hall.status = 'active';
        await hall.save();

        res.json({ 
            message: 'Hall monitoring started',
            hall
        });
    } catch (error) {
        logger.error('Error starting hall monitoring:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stop monitoring a hall
router.post('/stop-monitoring/:hallId', async (req, res) => {
    try {
        const { hallId } = req.params;

        const hall = await Hall.findById(hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        mlService.stopMonitoring(hallId);

        // Update hall status to inactive
        hall.status = 'inactive';
        await hall.save();

        res.json({ 
            message: 'Hall monitoring stopped',
            hall
        });
    } catch (error) {
        logger.error('Error stopping hall monitoring:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get ML model configuration for a hall
router.get('/config/:hallId', async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        res.json({
            hallId: hall._id,
            config: {
                distanceThreshold: hall.distanceThreshold,
                maxCapacity: hall.maxCapacity,
                isActive: hall.status === 'active',
                cameraUrl: hall.cameraUrl
            },
        });
    } catch (error) {
        logger.error('Error fetching ML configuration:', error);
        res.status(500).json({ message: 'Error fetching ML configuration' });
    }
});

// Stop all monitoring
router.post('/stop-all', async (req, res) => {
    try {
        mlService.stopAll();
        
        // Update all halls to inactive
        await Hall.updateMany({}, { status: 'inactive' });

        res.json({ message: 'All monitoring stopped' });
    } catch (error) {
        logger.error('Error stopping all monitoring:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start video processing
router.post('/process-video', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const videoPath = req.file.path;
        const hallId = req.body.hallId;
        
        // Get the absolute path to the Python script
        const scriptPath = path.resolve(process.cwd(), 'mlmodell', 'crowd_detection.py');
        
        // Check if the script exists
        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Python script not found at ${scriptPath}`);
        }

        logger.info(`Starting ML process with script: ${scriptPath}`);
        logger.info(`Video path: ${videoPath}`);
        logger.info(`Hall ID: ${hallId}`);

        // Start the Python process with proper error handling
        const pythonProcess = spawn('python', [
            scriptPath,
            '--video_path', videoPath,
            '--hall_id', hallId,
            '--websocket_url', 'ws://localhost:3001'
        ]);

        // Store the process
        activeJobs.set(hallId, {
            process: pythonProcess,
            videoPath: videoPath,
            startTime: new Date()
        });

        // Handle process output
        pythonProcess.stdout.on('data', (data) => {
            logger.info(`ML Output: ${data.toString()}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            logger.error(`ML Error: ${data.toString()}`);
        });

        pythonProcess.on('error', (error) => {
            logger.error(`Failed to start ML process: ${error.message}`);
            // Clean up
            activeJobs.delete(hallId);
            // Delete the video file
            fs.unlink(videoPath, (err) => {
                if (err) logger.error('Error deleting video file:', err);
            });
        });

        pythonProcess.on('close', (code) => {
            logger.info(`ML process exited with code ${code}`);
            // Clean up
            activeJobs.delete(hallId);
            // Delete the video file after processing
            fs.unlink(videoPath, (err) => {
                if (err) logger.error('Error deleting video file:', err);
            });
        });

        res.json({ 
            message: 'Video processing started',
            hallId: hallId,
            jobId: req.file.filename,
            scriptPath: scriptPath // Include this for debugging
        });

    } catch (error) {
        logger.error('Error processing video:', error);
        // Clean up the uploaded file if there's an error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) logger.error('Error deleting uploaded file:', err);
            });
        }
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message
        });
    }
});

// Stop video processing
router.post('/stop-processing/:hallId', async (req, res) => {
    try {
        const hallId = req.params.hallId;
        const job = activeJobs.get(hallId);

        if (!job) {
            return res.status(404).json({ error: 'No active processing job found' });
        }

        // Kill the Python process
        job.process.kill();
        
        // Clean up
        activeJobs.delete(hallId);
        
        // Delete the video file
        fs.unlink(job.videoPath, (err) => {
            if (err) console.error('Error deleting video file:', err);
        });

        res.json({ message: 'Processing stopped successfully' });

    } catch (error) {
        console.error('Error stopping processing:', error);
        res.status(500).json({ error: 'Failed to stop processing' });
    }
});

// Get processing status
router.get('/status/:hallId', (req, res) => {
    const hallId = req.params.hallId;
    const job = activeJobs.get(hallId);

    if (!job) {
        return res.json({ status: 'inactive' });
    }

    const duration = (new Date() - job.startTime) / 1000; // in seconds
    res.json({
        status: 'active',
        duration: duration,
        videoPath: job.videoPath
    });
});

export default router; 