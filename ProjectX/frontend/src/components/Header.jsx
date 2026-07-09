import React from "react";
import { AppBar, Toolbar, Typography, Box, Chip } from "@mui/material";

import InsightsIcon from "@mui/icons-material/Insights";
import CircleIcon from "@mui/icons-material/Circle";

const Header = () => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "#0b1220",
        color: "#e2e8f0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InsightsIcon sx={{ color: "#04222b" }} />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              Athena
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI SQL Analyst
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<CircleIcon sx={{ fontSize: "10px !important", color: "#16a34a !important" }} />}
          label="Connected"
          variant="outlined"
          sx={{ borderColor: "rgba(255,255,255,0.12)", color: "text.secondary" }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
