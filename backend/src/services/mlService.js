import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MLService {
    constructor() {
        this.hallProcesses = new Map(); // Map to store processes for each hall
    }

    async startMonitoring(hallId, cameraUrl, socketIO) {
        if (this.hallProcesses.has(hallId)) {
            throw new Error(`Hall ${hallId} is already being monitored`);
        }

        const pythonScript = path.resolve(__dirname, '../../../ml/try2.py');
        
        if (!fs.existsSync(pythonScript)) {
            throw new Error(`Python script not found at: ${pythonScript}`);
        }

        console.log(`Starting monitoring for hall ${hallId}`);
        
        const process = spawn('python', [pythonScript, hallId, cameraUrl || '0']);

        process.stdout.on('data', (data) => {
            try {
                const result = JSON.parse(data.toString());
                
                if (result.error) {
                    console.error(`ML Error for hall ${hallId}:`, result.error);
                    return;
                }

                if (result.status) {
                    console.log(`ML Status for hall ${hallId}:`, result.status);
                    return;
                }

                // Emit real-time updates to the frontend
                socketIO.to(`hall:${hallId}`).emit('hall_update', result);

                // If violations are detected, emit alert
                if (result.violations && result.violations.length > 0) {
                    socketIO.to(`hall:${hallId}`).emit('violation_alert', {
                        hallId,
                        violations: result.violations,
                        timestamp: result.timestamp
                    });
                }
            } catch (error) {
                console.log('Processing output:', data.toString());
            }
        });

        process.stderr.on('data', (data) => {
            console.error(`ML Error (Hall ${hallId}):`, data.toString());
        });

        process.on('close', (code) => {
            console.log(`ML process for hall ${hallId} exited with code ${code}`);
            this.hallProcesses.delete(hallId);
        });

        this.hallProcesses.set(hallId, process);
    }

    stopMonitoring(hallId) {
        const process = this.hallProcesses.get(hallId);
        if (process) {
            process.kill();
            this.hallProcesses.delete(hallId);
            console.log(`Stopped monitoring hall ${hallId}`);
        }
    }

    stopAll() {
        for (const [hallId, process] of this.hallProcesses) {
            process.kill();
            console.log(`Stopped monitoring hall ${hallId}`);
        }
        this.hallProcesses.clear();
    }
}

export const mlService = new MLService(); 