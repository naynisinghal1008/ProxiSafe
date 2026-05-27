import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

// Mock data - replace with actual API calls
const mockHallData = {
  id: 1,
  name: 'Main Hall',
  status: 'safe',
  currentCount: 45,
  maxCapacity: 100,
  violations: 0,
  location: 'Building A, Floor 1',
  history: [
    { time: '09:00', count: 30, violations: 0 },
    { time: '10:00', count: 45, violations: 0 },
    { time: '11:00', count: 60, violations: 1 },
    { time: '12:00', count: 75, violations: 2 },
    { time: '13:00', count: 45, violations: 0 },
  ],
  recentViolations: [
    {
      id: 1,
      timestamp: '2024-02-20T11:15:00',
      type: 'Distance Violation',
      severity: 'warning',
      description: 'Multiple people detected within 2m of each other',
    },
    {
      id: 2,
      timestamp: '2024-02-20T12:30:00',
      type: 'Capacity Warning',
      severity: 'critical',
      description: 'Hall approaching maximum capacity (90%)',
    },
  ],
};

const severityColors = {
  warning: 'warning',
  critical: 'error',
  info: 'info',
};

function HallDetails() {
  const { id } = useParams();
  const [hallData, setHallData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHallData = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHallData(mockHallData);
      } catch (error) {
        console.error('Error fetching hall data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHallData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchHallData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!hallData) {
    return (
      <Typography variant="h6" color="error">
        Hall not found
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {hallData.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {hallData.location}
      </Typography>

      <Grid container spacing={3}>
        {/* Live Feed Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Live Feed Placeholder
              {/* Replace with actual video feed component */}
            </Typography>
          </Paper>
        </Grid>

        {/* Statistics Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Current Status
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Current Count
              </Typography>
              <Typography variant="h4">
                {hallData.currentCount} / {hallData.maxCapacity}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Today's Violations
              </Typography>
              <Typography variant="h4" color={hallData.violations > 0 ? 'error.main' : 'success.main'}>
                {hallData.violations}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* History Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Crowd History
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hallData.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    name="People Count"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="violations"
                    stroke="#ff7300"
                    name="Violations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Violations Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Violations
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hallData.recentViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>
                        {format(new Date(violation.timestamp), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell>{violation.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={violation.severity}
                          color={severityColors[violation.severity]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{violation.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default HallDetails; 