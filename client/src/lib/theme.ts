// lib/theme.ts
import { createTheme } from "@mui/material/styles";

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2E8B57", // Custom primary color (e.g., green)
      light: "#66CDAA",
      dark: "#006400",
      contrastText: "#ffffff", // Text color on primary button
    },
    secondary: {
      main: "#FF6347", // Custom secondary color (e.g., tomato red)
      light: "#FF7F50",
      dark: "#B22222",
      contrastText: "#ffffff", // Text color on secondary button
    },
    background: {
      default: "#f0f8ff", // Lighter background color
      paper: "#ffffff", // Paper background (e.g., for cards)
    },
    text: {
      primary: "#333333", // Darker primary text
      secondary: "#555555", // Lighter secondary text
    },
    error: {
      main: "#D32F2F", // Custom error color (red)
    },
    success: {
      main: "#388E3C", // Custom success color (green)
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 500,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
  },
  spacing: 8, // Base spacing unit (8px)
  shape: {
    borderRadius: 8, // Default border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Disable uppercase transformation
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none", // Remove default shadow
        },
      },
    },
  },
});

export default theme;
