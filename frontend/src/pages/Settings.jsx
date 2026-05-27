import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API calls
const mockHalls = [
  {
    id: 1,
    name: 'Main Hall',
    location: 'Building A, Floor 1',
    maxCapacity: 100,
    distanceThreshold: 2.0,
    status: 'active',
  },
  {
    id: 2,
    name: 'Conference Room',
    location: 'Building B, Floor 2',
    maxCapacity: 30,
    distanceThreshold: 1.5,
    status: 'active',
  },
  {
    id: 3,
    name: 'Exhibition Hall',
    location: 'Building C, Floor 1',
    maxCapacity: 80,
    distanceThreshold: 2.0,
    status: 'inactive',
  },
];

function Settings() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    maxCapacity: '',
    distanceThreshold: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHalls(mockHalls);
      } catch (error) {
        console.error('Error fetching halls:', error);
        showSnackbar('Error loading halls', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const handleOpenDialog = (hall = null) => {
    if (hall) {
      setEditingHall(hall);
      setFormData({
        name: hall.name,
        location: hall.location,
        maxCapacity: hall.maxCapacity.toString(),
        distanceThreshold: hall.distanceThreshold.toString(),
      });
    } else {
      setEditingHall(null);
      setFormData({
        name: '',
        location: '',
        maxCapacity: '',
        distanceThreshold: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHall(null);
    setFormData({
      name: '',
      location: '',
      maxCapacity: '',
      distanceThreshold: '',
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.location || !formData.maxCapacity || !formData.distanceThreshold) {
        showSnackbar('Please fill in all fields', 'error');
        return;
      }

      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingHall) {
        // Update existing hall
        setHalls(halls.map(hall =>
          hall.id === editingHall.id
            ? {
                ...hall,
                ...formData,
                maxCapacity: parseInt(formData.maxCapacity),
                distanceThreshold: parseFloat(formData.distanceThreshold),
              }
            : hall
        ));
        showSnackbar('Hall updated successfully', 'success');
      } else {
        // Add new hall
        const newHall = {
          id: Math.max(...halls.map(h => h.id)) + 1,
          ...formData,
          maxCapacity: parseInt(formData.maxCapacity),
          distanceThreshold: parseFloat(formData.distanceThreshold),
          status: 'active',
        };
        setHalls([...halls, newHall]);
        showSnackbar('Hall added successfully', 'success');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving hall:', error);
      showSnackbar('Error saving hall', 'error');
    }
  };

  const handleDelete = async (hallId) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHalls(halls.filter(hall => hall.id !== hallId));
        showSnackbar('Hall deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting hall:', error);
        showSnackbar('Error deleting hall', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Settings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Hall
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Max Capacity</TableCell>
              <TableCell>Distance Threshold (m)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {halls.map((hall) => (
              <TableRow key={hall.id}>
                <TableCell>{hall.name}</TableCell>
                <TableCell>{hall.location}</TableCell>
                <TableCell>{hall.maxCapacity}</TableCell>
                <TableCell>{hall.distanceThreshold}</TableCell>
                <TableCell>
                  <Chip
                    label={hall.status}
                    color={hall.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(hall)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(hall.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingHall ? 'Edit Hall' : 'Add New Hall'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hall Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChange('location')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Capacity"
                type="number"
                value={formData.maxCapacity}
                onChange={handleInputChange('maxCapacity')}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Distance Threshold (m)"
                type="number"
                value={formData.distanceThreshold}
                onChange={handleInputChange('distanceThreshold')}
                required
                inputProps={{ min: 0.5, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingHall ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Settings; 