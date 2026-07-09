import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import StorageIcon from "@mui/icons-material/Storage";
import DnsIcon from "@mui/icons-material/Dns";
import TableChartIcon from "@mui/icons-material/TableChart";

import { backendUrl } from "../config";

const ACCENT = "#22d3ee";

// Staggers the reveal of a group of child nodes.
const groupVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const nodeVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 32 },
  },
};

function VLine({ height = 26 }) {
  return (
    <Box
      component={motion.div}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.25 }}
      sx={{
        width: 2,
        height,
        bgcolor: "rgba(34,211,238,0.35)",
        transformOrigin: "top",
      }}
    />
  );
}

function NodeBox({ icon, label, sublabel, onClick, active }) {
  return (
    <motion.div
      variants={nodeVariants}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.97 }}
    >
      <Box
        onClick={onClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          userSelect: "none",
          minWidth: 170,
          px: 3,
          py: 2.2,
          borderRadius: 3,
          bgcolor: "#111a2b",
          border: active
            ? `1px solid ${ACCENT}`
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: active
            ? "0 0 0 1px rgba(34,211,238,0.4), 0 8px 24px rgba(34,211,238,0.18)"
            : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          textAlign: "center",
          transition: "border-color .2s, box-shadow .2s",
          "&:hover": onClick
            ? {
                borderColor: ACCENT,
                boxShadow:
                  "0 0 0 1px rgba(34,211,238,0.4), 0 8px 24px rgba(34,211,238,0.15)",
              }
            : {},
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "rgba(34,211,238,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontWeight: 700, color: "#e2e8f0" }}>
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            {sublabel}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

// A row of child nodes, fanned out below a shared horizontal connector.
function ChildRow({ children }) {
  const items = React.Children.toArray(children);
  return (
    <Box sx={{ position: "relative", pt: 3, display: "flex", justifyContent: "center" }}>
      {items.length > 1 && (
        <Box
          component={motion.div}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          sx={{
            position: "absolute",
            top: 0,
            left: `${100 / (items.length * 2)}%`,
            right: `${100 / (items.length * 2)}%`,
            height: 2,
            bgcolor: "rgba(34,211,238,0.35)",
          }}
        />
      )}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
        {items.map((child, i) => (
          <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VLine height={16} />
            {child}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function DatabaseExplorer({ onSelectTable }) {
  const [dbExpanded, setDbExpanded] = useState(false);
  const [tablesExpanded, setTablesExpanded] = useState(false);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState(null);

  // Prefetch the table list as soon as the dashboard mounts, so it's already
  // in memory by the time the user clicks through — no wait on the click.
  useEffect(() => {
    let active = true;
    setLoadingTables(true);
    axios
      .post(`${backendUrl}/tools/list_tables`)
      .then((res) => {
        if (active) setTables(res.data.tables || []);
      })
      .catch(() => {
        if (active) setError("Could not load tables. Please try again.");
      })
      .finally(() => {
        if (active) setLoadingTables(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDatabaseClick = () => {
    setDbExpanded((prev) => !prev);
  };

  const handleDbNodeClick = () => {
    // Tables are already prefetched — just toggle the branch open/closed.
    setTablesExpanded((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
      {/* Level 0 — root */}
      <NodeBox
        icon={<StorageIcon sx={{ color: ACCENT }} />}
        label="Database"
        sublabel="Click to explore"
        onClick={handleDatabaseClick}
        active={dbExpanded}
      />

      <AnimatePresence>
        {dbExpanded && (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={groupVariants}
            style={{ width: "100%" }}
          >
            <ChildRow>
              {/* Level 1 — only one database for now */}
              <NodeBox
                icon={<DnsIcon sx={{ color: ACCENT }} />}
                label="neondb"
                sublabel="PostgreSQL"
                onClick={handleDbNodeClick}
                active={tablesExpanded}
              />
            </ChildRow>

            <AnimatePresence>
              {tablesExpanded && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={groupVariants}
                >
                  {loadingTables ? (
                    <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                      <CircularProgress size={28} sx={{ color: ACCENT }} />
                    </Box>
                  ) : error ? (
                    <Typography sx={{ textAlign: "center", pt: 4, color: "#f87171" }}>
                      {error}
                    </Typography>
                  ) : (
                    <ChildRow>
                      {tables.map((t) => (
                        <NodeBox
                          key={t}
                          icon={<TableChartIcon sx={{ color: ACCENT }} />}
                          label={t}
                          sublabel="Table"
                          onClick={() => onSelectTable(t)}
                        />
                      ))}
                    </ChildRow>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
