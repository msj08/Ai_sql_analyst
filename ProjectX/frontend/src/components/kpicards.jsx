import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

const cards = [
  { title: "Queries", value: "0" },
  { title: "Insights", value: "0" },
  { title: "Charts", value: "0" },
  { title: "Status", value: "Online" }
];

const KPICards = () => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card
            sx={{
              background: "#1e293b",
              color: "white",
              borderRadius: 3
            }}
          >
            <CardContent>
              <Typography variant="body2" color="gray">
                {card.title}
              </Typography>

              <Typography variant="h4" fontWeight="bold">
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;