import { Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function MessageBubble({ sender, text }) {
  const isUser = sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 18,
      }}
    >
      <Paper
        sx={{
          p: 2,
          maxWidth: "75%",
          borderRadius: 3,
          bgcolor: isUser ? "#3b82f6" : "#1e293b",
          color: "white",
        }}
      >
        <Typography>{text}</Typography>
      </Paper>
    </motion.div>
  );
}