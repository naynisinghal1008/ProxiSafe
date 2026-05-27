import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HallDetails from './pages/HallDetails';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Light blue
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1', // Light pink
      light: '#fce4ec',
      dark: '#f06292',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e', // Slightly lighter dark for cards/paper
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
    error: {
      main: '#ef5350',
    },
    warning: {
      main: '#ffb74d',
    },
    success: {
      main: '#66bb6a',
    },
    info: {
      main: '#29b6f6',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e1e1e',
          '&:hover': {
            backgroundColor: '#252525',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(102, 187, 106, 0.2)',
            color: '#66bb6a',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255, 183, 77, 0.2)',
            color: '#ffb74d',
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(239, 83, 80, 0.2)',
            color: '#ef5350',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: 'rgba(41, 182, 246, 0.2)',
            color: '#29b6f6',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'none',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hall/:id" element={<HallDetails />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
