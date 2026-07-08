import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip
} from "@mui/material";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import PsychologyIcon from "@mui/icons-material/Psychology";

const Header = () => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background:
          "linear-gradient(90deg,#7C3AED 0%, #3B82F6 50%, #06B6D4 100%)",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <SmartToyIcon sx={{ fontSize: 40 }} />

          <Box>
            <Typography variant="h5" fontWeight="bold">
              Athena AI SQL Analyst
            </Typography>

            <Typography variant="body2">
              Intelligent Analytics Dashboard
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<PsychologyIcon />}
          label="AI Connected"
          color="success"
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;