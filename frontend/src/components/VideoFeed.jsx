import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const VideoFeed = ({ hallId }) => {
    const [stats, setStats] = useState({ total_people: 0, violations: 0 });
    const [connected, setConnected] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        // Connect to WebSocket server
        wsRef.current = new WebSocket('ws://localhost:3001');

        wsRef.current.onopen = () => {
            console.log('Connected to WebSocket server');
            setConnected(true);
        };

        wsRef.current.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
        };

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Only process messages for this hall
                if (data.hall_id === hallId) {
                    // Update image
                    if (data.frame && imageRef.current) {
                        imageRef.current.src = `data:image/jpeg;base64,${data.frame}`;
                    }

                    // Update statistics
                    if (data.statistics) {
                        setStats(data.statistics);
                    }
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [hallId]);

    // Check processing status periodically
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await axios.get(`/api/ml/status/${hallId}`);
                setProcessing(response.data.status === 'active');
            } catch (error) {
                console.error('Error checking status:', error);
            }
        };

        if (processing) {
            const interval = setInterval(checkStatus, 5000);
            return () => clearInterval(interval);
        }
    }, [processing, hallId]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);
        formData.append('hallId', hallId);

        try {
            setError(null);
            setProcessing(true);
            await axios.post('/api/ml/process-video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error('Error uploading video:', error);
            setError('Failed to upload video. Please try again.');
            setProcessing(false);
        }
    };

    const handleStopProcessing = async () => {
        try {
            await axios.post(`/api/ml/stop-processing/${hallId}`);
            setProcessing(false);
        } catch (error) {
            console.error('Error stopping processing:', error);
            setError('Failed to stop processing. Please try again.');
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h6" gutterBottom>
                    Live Video Feed - Hall {hallId}
                </Typography>
                <Box sx={{ position: 'relative', width: '100%', height: 'auto' }}>
                    <img
                        ref={imageRef}
                        alt="Video Feed"
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '600px',
                            objectFit: 'contain'
                        }}
                    />
                    {processing && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )}
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h6" gutterBottom>
                    Controls
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                        disabled={processing}
                    >
                        Upload Video
                        <input
                            type="file"
                            hidden
                            accept="video/*"
                            onChange={handleFileUpload}
                        />
                    </Button>
                    {processing && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleStopProcessing}
                        >
                            Stop Processing
                        </Button>
                    )}
                </Box>
                {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h6" gutterBottom>
                    Statistics
                </Typography>
                <Typography>
                    Connection Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
                </Typography>
                <Typography>
                    Processing Status: {processing ? '⚙️ Processing' : '⏹️ Stopped'}
                </Typography>
                <Typography>
                    Total People: {stats.total_people}
                </Typography>
                <Typography>
                    Violations: {stats.violations}
                </Typography>
            </Paper>
        </Box>
    );
};

export default VideoFeed; 