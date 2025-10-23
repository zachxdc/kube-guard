import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#111111',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10B981',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      light: 'rgba(239, 68, 68, 0.15)',
    },
    success: {
      main: '#10B981',
      light: 'rgba(16, 185, 129, 0.15)',
    },
    warning: {
      main: '#FCD34D',
      light: '#FEF3C7',
      dark: '#92400E',
    },
    background: {
      default: '#ffffff',
      paper: '#fafafa',
    },
    grey: {
      100: '#f0f0f0',
      200: '#eeeeee',
      300: '#dddddd',
      400: '#888888',
      500: '#666666',
      600: '#999999',
    },
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
    },
    body2: {
      color: '#666666',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

