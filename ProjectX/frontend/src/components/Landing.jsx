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
import { motion } from "framer-motion";

import InsightsIcon from "@mui/icons-material/Insights";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import StorageIcon from "@mui/icons-material/Storage";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

// Palette tuned to the dark, cyan-accented trading video used in the hero.
const BG = "#0b1220"; // deep navy — flows out of the video
const BG2 = "#0f172a"; // slightly lighter section band
const CARD = "#111a2b";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#e2e8f0";
const MUTED = "#94a3b8";
const ACCENT = "#22d3ee"; // cyan, echoing the chart lines in the video

const features = [
  {
    icon: <AutoAwesomeIcon sx={{ color: ACCENT }} />,
    title: "Plain-English questions",
    desc: "Ask “What is total revenue by month?” and Athena writes the SQL for you — no query language required.",
  },
  {
    icon: <QueryStatsIcon sx={{ color: ACCENT }} />,
    title: "Instant charts & tables",
    desc: "Every answer comes back as a clean chart and a data table, ready to read at a glance.",
  },
  {
    icon: <StorageIcon sx={{ color: ACCENT }} />,
    title: "Live hosted database",
    desc: "Runs real queries against your PostgreSQL database in the cloud — always current, never mocked.",
  },
  {
    icon: <PushPinOutlinedIcon sx={{ color: ACCENT }} />,
    title: "Pinned insights",
    desc: "Save the answers that matter to a dashboard so your key metrics are one click away.",
  },
];

const steps = [
  { n: "1", title: "Ask a question", desc: "Type what you want to know in everyday language." },
  { n: "2", title: "Athena writes SQL", desc: "The AI turns your question into a safe, read-only query." },
  { n: "3", title: "See the answer", desc: "Get a chart, a table, and a short explanation instantly." },
];

// Reveal-on-scroll wrapper: fades and slides its children in when they enter view.
function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Landing({ onLaunch, onChat }) {
  return (
    <Box sx={{ bgcolor: BG, minHeight: "100vh" }}>
      {/* ===================== FULL-SCREEN VIDEO HERO ===================== */}
      <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {/* Background video */}
        <Box
          component="video"
          src="/resources/video1.mp4"
          autoPlay
          muted
          loop
          playsInline
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark overlay so the text stays readable, fading into the page below */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.6) 55%, rgba(11,18,32,1) 100%)",
          }}
        />

        {/* Top navigation (over the video) */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2.5,
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InsightsIcon sx={{ color: "#04222b", fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Athena
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button variant="text" onClick={onLaunch} sx={{ color: "white" }}>
                Dashboard
              </Button>
              <Button
                variant="contained"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={onChat}
                sx={{ bgcolor: ACCENT, color: "#04222b", "&:hover": { bgcolor: "#06b6d4" } }}
              >
                Open Chatbot
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Hero content */}
        <Container
          maxWidth="md"
          sx={{
            position: "relative",
            zIndex: 2,
            height: "calc(100vh - 88px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Chip
              label="AI-powered SQL analytics"
              variant="outlined"
              sx={{
                mb: 3,
                color: ACCENT,
                borderColor: "rgba(34,211,238,0.4)",
                bgcolor: "rgba(34,211,238,0.08)",
              }}
            />
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em", mb: 2, lineHeight: 1.1 }}
            >
              Talk to your data.
              <br />
              Get answers, not queries.
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 400, mb: 4 }}
            >
              Athena is an AI data analyst that turns plain-English questions into SQL,
              runs them on your database, and hands you the chart and the numbers.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={onChat}
                sx={{ bgcolor: ACCENT, color: "#04222b", "&:hover": { bgcolor: "#06b6d4" } }}
              >
                Try the Chatbot
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={onLaunch}
                sx={{ color: "white", borderColor: "rgba(255,255,255,0.6)" }}
              >
                View Dashboard
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ===================== PRODUCT SCREENSHOT ===================== */}
      <Container maxWidth="lg" sx={{ pt: 10, pb: 10 }}>
        <Reveal>
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${BORDER}`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              lineHeight: 0,
            }}
          >
            <img
              src="/resources/picture1.jpeg"
              alt="Athena dashboard preview"
              style={{ width: "100%", display: "block" }}
            />
          </Box>
        </Reveal>
      </Container>

      {/* ===================== FEATURES ===================== */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Reveal>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, textAlign: "center", mb: 1, color: TEXT }}
          >
            Everything you need to explore your data
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: MUTED, textAlign: "center", mb: 5 }}
          >
            No SQL knowledge required.
          </Typography>
        </Reveal>

        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Reveal delay={i * 0.1}>
                <Card
                  sx={{
                    height: "100%",
                    bgcolor: CARD,
                    border: `1px solid ${BORDER}`,
                    boxShadow: "none",
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 1.5 }}>{f.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: TEXT }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: MUTED }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ===================== HOW IT WORKS ===================== */}
      <Box sx={{ bgcolor: BG2, borderTop: `1px solid ${BORDER}`, py: 10 }}>
        <Container maxWidth="lg">
          <Reveal>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, textAlign: "center", mb: 6, color: TEXT }}
            >
              How it works
            </Typography>
          </Reveal>
          <Grid container spacing={4}>
            {steps.map((s, i) => (
              <Grid item xs={12} md={4} key={s.n}>
                <Reveal delay={i * 0.12}>
                  <Box sx={{ textAlign: "center", px: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: ACCENT,
                        color: "#04222b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {s.n}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: TEXT }}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: MUTED }}>
                      {s.desc}
                    </Typography>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>

          <Reveal>
            <Box sx={{ textAlign: "center", mt: 7 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={onChat}
                sx={{ bgcolor: ACCENT, color: "#04222b", "&:hover": { bgcolor: "#06b6d4" } }}
              >
                Start asking questions
              </Button>
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, textAlign: "center", bgcolor: BG }}>
        <Typography variant="caption" sx={{ color: MUTED }}>
          Athena · AI SQL Data Analyst & Business Intelligence Dashboard
        </Typography>
      </Box>
    </Box>
  );
}
