import { Paper, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Render the small data table that came back with a bot answer.
function DataTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  const columns = Object.keys(rows[0]);

  return (
    <Box sx={{ overflowX: "auto", mt: 1 }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: 13,
          color: "#0f172a",
        }}
      >
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: "left",
                  padding: "6px 10px",
                  borderBottom: "2px solid #e2e8f0",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {c.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td
                  key={c}
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  {String(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

// Render the chart spec (line or bar) produced by the backend.
function Chart({ chart }) {
  if (!chart || !chart.data || chart.data.length === 0) return null;
  const { chart_type, data, x, y } = chart;

  return (
    <Box sx={{ width: "100%", height: 260, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        {chart_type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={x} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={y} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={x} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey={y} stroke="#3b82f6" strokeWidth={2} dot />
          </LineChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
}

export default function MessageBubble({ sender, text, detail, sql, notes, nextSteps }) {
  const isUser = sender === "user";
  const chart = detail?.chart;
  const table = detail?.table;
  const hasData = (chart && chart.data?.length) || (table && table.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 18,
      }}
    >
      {/* The text answer bubble */}
      <Paper
        sx={{
          p: 2,
          maxWidth: "85%",
          borderRadius: 3,
          bgcolor: isUser ? "#3b82f6" : "#1e293b",
          color: "white",
        }}
      >
        <Typography sx={{ whiteSpace: "pre-wrap" }}>{text}</Typography>
      </Paper>

      {/* For bot answers with query results: a light card with chart + table */}
      {!isUser && hasData && (
        <Paper
          sx={{
            p: 2,
            mt: 1,
            width: "85%",
            borderRadius: 3,
            bgcolor: "#ffffff",
            color: "#0f172a",
          }}
        >
          <Chart chart={chart} />
          <DataTable rows={table} />
        </Paper>
      )}

    </motion.div>
  );
}
