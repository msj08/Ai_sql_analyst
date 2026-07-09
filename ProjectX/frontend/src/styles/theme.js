import { createTheme } from "@mui/material/styles";

// Light, formal palette: slate neutrals with a single professional blue accent.
const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#2563eb", // blue-600
      dark: "#1d4ed8",
    },

    secondary: {
      main: "#0f766e", // teal-700, used sparingly
    },

    success: {
      main: "#16a34a",
    },

    error: {
      main: "#dc2626",
    },

    warning: {
      main: "#d97706",
    },

    background: {
      default: "#f8fafc", // slate-50
      paper: "#ffffff",
    },

    text: {
      primary: "#0f172a", // slate-900
      secondary: "#64748b", // slate-500
    },

    divider: "#e2e8f0", // slate-200
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "9px 20px",
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
