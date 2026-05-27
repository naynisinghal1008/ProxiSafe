// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Chip,
//   IconButton,
//   CircularProgress,
// } from '@mui/material';
// import {
//   People as PeopleIcon,
//   Warning as WarningIcon,
//   LocationOn as LocationIcon,
// } from '@mui/icons-material';

// // Mock data - replace with actual API call
// const mockHalls = [
//   {
//     id: 1,
//     name: 'Main Hall',
//     status: 'safe',
//     currentCount: 45,
//     maxCapacity: 100,
//     violations: 0,
//     location: 'Building A, Floor 1',
//   },
//   {
//     id: 2,
//     name: 'Conference Room',
//     status: 'warning',
//     currentCount: 28,
//     maxCapacity: 30,
//     violations: 2,
//     location: 'Building B, Floor 2',
//   },
//   {
//     id: 3,
//     name: 'Exhibition Hall',
//     status: 'critical',
//     currentCount: 95,
//     maxCapacity: 80,
//     violations: 5,
//     location: 'Building C, Floor 1',
//   },
// ];

// const statusColors = {
//   safe: 'success',
//   warning: 'warning',
//   critical: 'error',
// };

// const statusLabels = {
//   safe: 'Safe',
//   warning: 'Warning',
//   critical: 'Critical',
// };

// function Dashboard() {
//   const [halls, setHalls] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Simulate API call
//     const fetchHalls = async () => {
//       try {
//         // Replace with actual API call
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         setHalls(mockHalls);
//       } catch (error) {
//         console.error('Error fetching halls:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHalls();
//     // Set up polling every 30 seconds
//     const interval = setInterval(fetchHalls, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         Hall Overview
//       </Typography>
//       <Grid container spacing={3}>
//         {halls.map((hall) => (
//           <Grid item xs={12} sm={6} md={4} key={hall.id}>
//             <Card
//               sx={{
//                 cursor: 'pointer',
//                 '&:hover': {
//                   boxShadow: 6,
//                 },
//               }}
//               onClick={() => navigate(`/hall/${hall.id}`)}
//             >
//               <CardContent>
//                 <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                   <Typography variant="h6" component="div">
//                     {hall.name}
//                   </Typography>
//                   <Chip
//                     label={statusLabels[hall.status]}
//                     color={statusColors[hall.status]}
//                     size="small"
//                   />
//                 </Box>
                
//                 <Box display="flex" alignItems="center" mb={1}>
//                   <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
//                   <Typography variant="body2" color="text.secondary">
//                     {hall.currentCount} / {hall.maxCapacity} people
//                   </Typography>
//                 </Box>

//                 <Box display="flex" alignItems="center" mb={1}>
//                   <WarningIcon sx={{ mr: 1, color: hall.violations > 0 ? 'error.main' : 'text.secondary' }} />
//                   <Typography variant="body2" color={hall.violations > 0 ? 'error.main' : 'text.secondary'}>
//                     {hall.violations} violations today
//                   </Typography>
//                 </Box>

//                 <Box display="flex" alignItems="center">
//                   <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
//                   <Typography variant="body2" color="text.secondary">
//                     {hall.location}
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }

// export default Dashboard; 


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { io } from 'socket.io-client';

// Replace with your backend URL/port
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
  autoConnect: true,
  reconnection: true
});

// Replace this with your real API or static data
const initialHalls = [
  {
    id: 'hall_1',
    name: 'Main Hall',
    status: 'safe',
    currentCount: 45,
    maxCapacity: 100,
    violations: 0,
    location: 'Building A, Floor 1',
  },
  {
    id: 'hall_2',
    name: 'Conference Room',
    status: 'warning',
    currentCount: 28,
    maxCapacity: 30,
    violations: 2,
    location: 'Building B, Floor 2',
  },
  {
    id: 'hall_3',
    name: 'Exhibition Hall',
    status: 'critical',
    currentCount: 95,
    maxCapacity: 80,
    violations: 5,
    location: 'Building C, Floor 1',
  },
];

const statusColors = {
  safe: 'success',
  warning: 'warning',
  critical: 'error',
};

const statusLabels = {
  safe: 'Safe',
  warning: 'Warning',
  critical: 'Critical',
};

function getStatus(people, capacity, violations) {
  if (violations > 3 || people > capacity) return 'critical';
  if (violations > 0 || people > 0.8 * capacity) return 'warning';
  return 'safe';
}

function Dashboard() {
  const [halls, setHalls] = useState(initialHalls);
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(false); // Set to false if you don't want the spinner
  const navigate = useNavigate();

  useEffect(() => {
    // Join all hall rooms
    halls.forEach(hall => {
      socket.emit('join_hall', hall.id);
    });

    socket.on('hall_update', (data) => {
      setLiveData(prev => ({
        ...prev,
        [data.hall_id]: data
      }));
    });

    return () => {
      halls.forEach(hall => {
        socket.emit('leave_hall', hall.id);
      });
      socket.off('hall_update');
    };
  }, [halls]);

  // Merge liveData into halls for display
  const displayHalls = halls.map(hall => {
    const data = liveData[hall.id];
    const people = data?.statistics?.total_people ?? hall.currentCount;
    const violations = data?.statistics?.violations ?? hall.violations;
    const status = getStatus(people, hall.maxCapacity, violations);

    return {
      ...hall,
      currentCount: people,
      violations: violations,
      status: status,
    };
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hall Overview
      </Typography>
      <Grid container spacing={3}>
        {displayHalls.map((hall) => (
          <Grid item xs={12} sm={6} md={4} key={hall.id}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(`/hall/${hall.id}`)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="div">
                    {hall.name}
                  </Typography>
                  <Chip
                    label={statusLabels[hall.status]}
                    color={statusColors[hall.status]}
                    size="small"
                  />
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {hall.currentCount} / {hall.maxCapacity} people
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <WarningIcon sx={{ mr: 1, color: hall.violations > 0 ? 'error.main' : 'text.secondary' }} />
                  <Typography variant="body2" color={hall.violations > 0 ? 'error.main' : 'text.secondary'}>
                    {hall.violations} violations today
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center">
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {hall.location}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;