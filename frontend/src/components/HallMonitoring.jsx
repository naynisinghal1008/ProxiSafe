import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Grid, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  LinearProgress,
  Chip
} from '@mui/material';
import { io } from 'socket.io-client';
import { useTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';

// Initialize socket connection
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
  autoConnect: true,
  reconnection: true
});

const HallMonitoring = ({ hallId }) => {
  const theme = useTheme();
  const [monitoringData, setMonitoringData] = useState(null);
  const [violations, setViolations] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to socket and join hall room
    if (hallId) {
      socket.emit('join_hall', hallId);
      setIsConnected(true);
      console.log('Joined hall:', hallId);
    }

    // Listen for hall updates
    socket.on('hall_update', (data) => {
      console.log('Received hall update:', data);
      setMonitoringData(data);
    });

    // Listen for violation alerts
    socket.on('violation_alert', (data) => {
      console.log('Received violation alert:', data);
      setViolations(prev => [...prev, data]);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection error: ' + error.message);
      setIsConnected(false);
    });

    // Cleanup function
    return () => {
      if (hallId) {
        socket.emit('leave_hall', hallId);
      }
      socket.off('hall_update');
      socket.off('violation_alert');
      socket.off('connect_error');
    };
  }, [hallId]);

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Connection Status */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 2, 
              bgcolor: theme.palette.background.paper,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <SecurityIcon color={isConnected ? "success" : "error"} />
            <Typography variant="h6">
              Monitoring Status: {isConnected ? 'Active' : 'Disconnected'}
            </Typography>
          </Paper>
        </Grid>

        {/* Live Statistics Cards */}
        {monitoringData && (
          <>
            {/* People Count Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: theme.palette.background.paper }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PeopleIcon fontSize="large" color="primary" />
                    <Typography variant="h6">People Count</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ textAlign: 'center', my: 2 }}>
                    {monitoringData.statistics.total_people}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(monitoringData.timestamp).toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Violations Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: theme.palette.background.paper }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <WarningIcon fontSize="large" color="warning" />
                    <Typography variant="h6">Active Violations</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ textAlign: 'center', my: 2 }}>
                    {monitoringData.statistics.violations}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(monitoringData.statistics.violations / monitoringData.statistics.total_people) * 100 || 0}
                    color="warning"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Live Feed Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: theme.palette.background.paper }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Live Feed</Typography>
                  {monitoringData.frame && (
                    <CardMedia
                      component="img"
                      image={`data:image/jpeg;base64,${monitoringData.frame}`}
                      alt="Live feed"
                      sx={{ width: '100%', borderRadius: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Recent Violations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Violations</Typography>
            <Grid container spacing={2}>
              {violations.slice(-5).reverse().map((violation, index) => (
                <Grid item xs={12} key={index}>
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      '& .MuiAlert-message': {
                        flex: 1
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          Social Distance Violation Detected
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(violation.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${violation.violations.length} violations`}
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </Alert>
                </Grid>
              ))}
              {violations.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No violations detected</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HallMonitoring; 