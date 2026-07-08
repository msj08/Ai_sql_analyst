import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#7C3AED",
    },

    secondary: {
      main: "#06B6D4",
    },

    success: {
      main: "#22C55E",
    },

    error: {
      main: "#EF4444",
    },

    warning: {
      main: "#F59E0B",
    },

    background: {
      default: "#0B1120",
      paper: "#111827",
    },

    text: {
      primary: "#F8FAFC",
      secondary: "#94A3B8",
    },
  },

  shape: {
    borderRadius: 16,
  },

  typography: {
    fontFamily: "'Inter', sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

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
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: "rgba(17,24,39,.92)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: "10px 22px",
        },
      },
    },
  },
});

export default theme;