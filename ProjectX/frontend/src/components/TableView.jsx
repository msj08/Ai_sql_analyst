import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { backendUrl } from "../config";

const ACCENT = "#22d3ee";
const PIE_COLORS = [
  "#22d3ee", "#38bdf8", "#818cf8", "#a78bfa", "#f472b6",
  "#fb7185", "#fbbf24", "#34d399", "#60a5fa", "#c084fc",
];

// Is a column numeric across the sampled rows?
function isNumericColumn(rows, col) {
  return rows.some((r) => typeof r[col] === "number") &&
    rows.every((r) => r[col] === null || typeof r[col] === "number");
}

export default function TableView({ tableName, onBack }) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chartType, setChartType] = useState("bar");
  const [labelCol, setLabelCol] = useState("");
  const [valueCol, setValueCol] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    axios
      .post(`${backendUrl}/tools/sample_rows?table_name=${encodeURIComponent(tableName)}&limit=100`)
      .then((res) => {
        if (!active) return;
        const data = res.data.rows || [];
        const cols = res.data.columns || (data[0] ? Object.keys(data[0]) : []);
        setRows(data);
        setColumns(cols);

        // Sensible defaults: first non-numeric col as label, first numeric as value.
        const numeric = cols.filter((c) => isNumericColumn(data, c));
        const nonNumeric = cols.filter((c) => !isNumericColumn(data, c));
        setValueCol(numeric[0] || cols[cols.length - 1] || "");
        setLabelCol(nonNumeric[0] || cols[0] || "");
      })
      .catch(() => active && setError("Could not load this table."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tableName]);

  const numericColumns = useMemo(
    () => columns.filter((c) => isNumericColumn(rows, c)),
    [columns, rows]
  );

  // Aggregate rows into chart data: sum(valueCol) grouped by labelCol.
  const chartData = useMemo(() => {
    if (!labelCol || !valueCol || rows.length === 0) return [];
    const map = new Map();
    rows.forEach((r) => {
      const key = String(r[labelCol]);
      const val = typeof r[valueCol] === "number" ? r[valueCol] : Number(r[valueCol]) || 0;
      map.set(key, (map.get(key) || 0) + val);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [rows, labelCol, valueCol]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b1220", color: "#e2e8f0", px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button variant="text" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: ACCENT }}>
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {tableName}
        </Typography>
        {!loading && !error && (
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            {rows.length} rows
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      ) : error ? (
        <Typography sx={{ color: "#f87171", pt: 4 }}>{error}</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* LEFT — data table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              sx={{
                bgcolor: "#111a2b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box sx={{ overflowX: "auto", maxHeight: "75vh", overflowY: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th
                          key={c}
                          style={{
                            position: "sticky",
                            top: 0,
                            background: "#0f1826",
                            color: ACCENT,
                            textAlign: "left",
                            padding: "10px 14px",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                        {columns.map((c) => (
                          <td
                            key={c}
                            style={{
                              padding: "9px 14px",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              color: "#cbd5e1",
                              whiteSpace: "nowrap",
                              textAlign: typeof row[c] === "number" ? "right" : "left",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {row[c] === null ? "—" : String(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          </motion.div>

          {/* RIGHT — chart panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Box
              sx={{
                bgcolor: "#111a2b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 3,
                p: 2.5,
                position: { md: "sticky" },
                top: { md: 16 },
              }}
            >
              {/* Chart type selector */}
              <ToggleButtonGroup
                value={chartType}
                exclusive
                size="small"
                onChange={(e, v) => v && setChartType(v)}
                sx={{
                  mb: 2,
                  "& .MuiToggleButton-root": {
                    color: "#94a3b8",
                    borderColor: "rgba(255,255,255,0.12)",
                    textTransform: "none",
                  },
                  "& .Mui-selected": {
                    color: "#04222b !important",
                    bgcolor: `${ACCENT} !important`,
                  },
                }}
              >
                <ToggleButton value="bar">Bar graph</ToggleButton>
                <ToggleButton value="pie">Pie chart</ToggleButton>
              </ToggleButtonGroup>

              {/* Column selectors */}
              <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={dropdownSx} fullWidth>
                  <InputLabel>Group by</InputLabel>
                  <Select value={labelCol} label="Group by" onChange={(e) => setLabelCol(e.target.value)}>
                    {columns.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={dropdownSx} fullWidth>
                  <InputLabel>Value</InputLabel>
                  <Select value={valueCol} label="Value" onChange={(e) => setValueCol(e.target.value)}>
                    {(numericColumns.length ? numericColumns : columns).map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* The chart */}
              <Box sx={{ width: "100%", height: 340 }}>
                {chartData.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", pt: 8 }}>
                    Pick a group-by and value column to plot.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
                      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                          height={50}
                        />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipSx} />
                        <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={{ fill: "#cbd5e1", fontSize: 11 }}
                        >
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipSx} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                )}
              </Box>
            </Box>
          </motion.div>
        </Box>
      )}
    </Box>
  );
}

const dropdownSx = {
  "& .MuiOutlinedInput-root": { color: "#e2e8f0" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "& .MuiSvgIcon-root": { color: "#94a3b8" },
};

const tooltipSx = {
  background: "#0f1826",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#e2e8f0",
};
