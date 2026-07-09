import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";

import InsightsIcon from "@mui/icons-material/Insights";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import StorageIcon from "@mui/icons-material/Storage";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

const features = [
  {
    icon: <AutoAwesomeIcon color="primary" />,
    title: "Plain-English questions",
    desc: "Ask “What is total revenue by month?” and Athena writes the SQL for you — no query language required.",
  },
  {
    icon: <QueryStatsIcon color="primary" />,
    title: "Instant charts & tables",
    desc: "Every answer comes back as a clean chart and a data table, ready to read at a glance.",
  },
  {
    icon: <StorageIcon color="primary" />,
    title: "Live hosted database",
    desc: "Runs real queries against your PostgreSQL database in the cloud — always current, never mocked.",
  },
  {
    icon: <PushPinOutlinedIcon color="primary" />,
    title: "Pinned insights",
    desc: "Save the answers that matter to a dashboard so your key metrics are one click away.",
  },
];

const steps = [
  { n: "1", title: "Ask a question", desc: "Type what you want to know in everyday language." },
  { n: "2", title: "Athena writes SQL", desc: "The AI turns your question into a safe, read-only query." },
  { n: "3", title: "See the answer", desc: "Get a chart, a table, and a short explanation instantly." },
];

export default function Landing({ onLaunch, onChat }) {
  return (
    <Box sx={{ bgcolor: "#f0f9ff", minHeight: "100vh" }}>
      {/* Top navigation */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e0f2fe",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InsightsIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Athena
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button variant="text" onClick={onLaunch}>
                Dashboard
              </Button>
              <Button
                variant="contained"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={onChat}
              >
                Open Chatbot
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Container maxWidth="md" sx={{ textAlign: "center", pt: { xs: 8, md: 12 }, pb: 6 }}>
        <Chip
          label="AI-powered SQL analytics"
          variant="outlined"
          sx={{ mb: 3, borderColor: "#bae6fd", color: "text.secondary" }}
        />
        <Typography
          variant="h3"
          sx={{ fontWeight: 800, letterSpacing: "-0.02em", mb: 2, lineHeight: 1.1 }}
        >
          Talk to your data.
          <br />
          Get answers, not queries.
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 400, mb: 4 }}>
          Athena is an AI data analyst that turns plain-English questions into SQL,
          runs them on your database, and hands you the chart and the numbers.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={onChat}
          >
            Try the Chatbot
          </Button>
          <Button variant="outlined" size="large" onClick={onLaunch}>
            View Dashboard
          </Button>
        </Box>
      </Container>

      {/* Product preview placeholder — replace with your screenshot / animation */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Box
          sx={{
            border: "2px dashed #bae6fd",
            borderRadius: 4,
            bgcolor: "#ffffff",
            height: { xs: 220, md: 380 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          <InsightsIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body2">
            Add a product screenshot or demo animation here
          </Typography>
        </Box>
      </Container>

      {/* Features */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center", mb: 1 }}>
          Everything you need to explore your data
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", textAlign: "center", mb: 5 }}
        >
          No SQL knowledge required.
        </Typography>

        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ mb: 1.5 }}>{f.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works */}
      <Box sx={{ bgcolor: "#ffffff", borderTop: "1px solid #e0f2fe", py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center", mb: 6 }}>
            How it works
          </Typography>
          <Grid container spacing={4}>
            {steps.map((s) => (
              <Grid item xs={12} md={4} key={s.n}>
                <Box sx={{ textAlign: "center", px: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {s.n}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 7 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={onChat}
            >
              Start asking questions
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Athena · AI SQL Data Analyst & Business Intelligence Dashboard
        </Typography>
      </Box>
    </Box>
  );
}
