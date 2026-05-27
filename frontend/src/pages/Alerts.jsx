import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Mock data - replace with actual API call
const mockAlerts = [
  {
    id: 1,
    hallName: 'Main Hall',
    timestamp: '2024-02-20T11:15:00',
    type: 'Distance Violation',
    severity: 'warning',
    description: 'Multiple people detected within 2m of each other',
  },
  {
    id: 2,
    hallName: 'Conference Room',
    timestamp: '2024-02-20T12:30:00',
    type: 'Capacity Warning',
    severity: 'critical',
    description: 'Hall approaching maximum capacity (90%)',
  },
  {
    id: 3,
    hallName: 'Exhibition Hall',
    timestamp: '2024-02-20T13:45:00',
    type: 'Distance Violation',
    severity: 'warning',
    description: 'Group of 5 people detected in close proximity',
  },
];

const severityColors = {
  warning: 'warning',
  critical: 'error',
  info: 'info',
};

const alertTypes = ['All', 'Distance Violation', 'Capacity Warning'];
const severityLevels = ['All', 'warning', 'critical', 'info'];
const halls = ['All', 'Main Hall', 'Conference Room', 'Exhibition Hall'];

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    hall: 'All',
    type: 'All',
    severity: 'All',
    dateRange: '',
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
    setPage(0);
  };

  const filteredAlerts = alerts.filter((alert) => {
    return (
      (filters.hall === 'All' || alert.hallName === filters.hall) &&
      (filters.type === 'All' || alert.type === filters.type) &&
      (filters.severity === 'All' || alert.severity === filters.severity) &&
      (!filters.dateRange || alert.timestamp.includes(filters.dateRange))
    );
  });

  const handleExport = () => {
    // Implement CSV export functionality
    console.log('Exporting alerts...');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Alerts</Typography>
        <Tooltip title="Export to CSV">
          <IconButton onClick={handleExport}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Hall"
              value={filters.hall}
              onChange={handleFilterChange('hall')}
              size="small"
            >
              {halls.map((hall) => (
                <MenuItem key={hall} value={hall}>
                  {hall}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Alert Type"
              value={filters.type}
              onChange={handleFilterChange('type')}
              size="small"
            >
              {alertTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Severity"
              value={filters.severity}
              onChange={handleFilterChange('severity')}
              size="small"
            >
              {severityLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={filters.dateRange}
              onChange={handleFilterChange('dateRange')}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Hall</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    {format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell>{alert.hallName}</TableCell>
                  <TableCell>{alert.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={alert.severity}
                      color={severityColors[alert.severity]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{alert.description}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAlerts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}

export default Alerts; 