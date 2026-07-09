import { createTheme } from "@mui/material/styles";

// Dark navy + cyan palette, matching the landing page / hero video.
const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#22d3ee", // cyan-400 (accent from the chart video)
      dark: "#06b6d4",
      contrastText: "#04222b",
    },

    secondary: {
      main: "#38bdf8", // sky-400
    },

    success: {
      main: "#22c55e",
    },

    error: {
      main: "#ef4444",
    },

    warning: {
      main: "#f59e0b",
    },

    background: {
      default: "#0b1220", // deep navy
      paper: "#111a2b",
    },

    text: {
      primary: "#e2e8f0", // slate-200
      secondary: "#94a3b8", // slate-400
    },

    divider: "rgba(255,255,255,0.08)",
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
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
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
