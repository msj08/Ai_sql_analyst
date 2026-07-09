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
        background: "#ffffff",
        color: "#0f172a",
        borderBottom: "1px solid #e2e8f0",
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
            <InsightsIcon sx={{ color: "white" }} />
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
          sx={{ borderColor: "#e2e8f0", color: "text.secondary" }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
