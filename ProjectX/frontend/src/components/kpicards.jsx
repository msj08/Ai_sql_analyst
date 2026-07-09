import React from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";

const cards = [
  { title: "Queries", value: "0" },
  { title: "Insights", value: "0" },
  { title: "Charts", value: "0" },
  { title: "Status", value: "Online", accent: "#16a34a" },
];

const KPICards = () => {
  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card sx={{ bgcolor: "#111a2b", borderRadius: 3 }}>
            <CardContent>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: "0.06em" }}
              >
                {card.title}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: card.accent || "text.primary" }}
                >
                  {card.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;
