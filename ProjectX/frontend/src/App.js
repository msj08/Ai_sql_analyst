import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Grid
} from "@mui/material";

import Header from "./components/Header";
import KPICards from "./components/kpicards";
import MessageBubble from "./components/messagebubble";
import Landing from "./components/Landing";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';

const backendUrl = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Which page is showing: 'landing', 'dashboard', or the full-screen 'chat'.
  const [page, setPage] = useState('landing');

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);

    try {
      const userMessage = {
        id: Date.now(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      const currentInput = inputValue;
      setInputValue('');

      const response = await axios.post(`${backendUrl}/chat`, {
        message: currentInput
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.answer,
        sender: 'bot',
        timestamp: new Date(),
        detail: response.data.detail,
        sql: response.data.sql,
        notes: response.data.notes,
        nextSteps: response.data.next_steps
      };

      setMessages(prev => [...prev, botMessage]);
      loadInsights();
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your request.',
        sender: 'bot',
        timestamp: new Date(),
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await axios.get(`${backendUrl}/dashboard/insights`);
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const unpinInsight = async (id) => {
    try {
      await axios.delete(`${backendUrl}/dashboard/insights/${id}`);
      loadInsights();
    } catch (error) {
      console.error('Error unpinning insight:', error);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // ------------------------------------------------------------------
  // CHAT PAGE
  // ------------------------------------------------------------------
  const renderChatPage = () => (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#f8fafc',
        color: '#0f172a'
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0
        }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => setPage('dashboard')}
          sx={{ color: 'primary.main' }}
        >
          Dashboard
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Athena
        </Typography>
      </Box>

      {/* Scrollable messages area */}
      <Box id="chat-messages" sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Box sx={{ maxWidth: 820, mx: 'auto', px: 2, py: 4 }}>
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.7 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Ask Athena about your data
              </Typography>
              <Typography variant="body2">
                Try "What is total revenue by month?" or "Show me the top 5 products by revenue"
              </Typography>
            </Box>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              sender={msg.sender}
              text={msg.text}
              detail={msg.detail}
              sql={msg.sql}
              notes={msg.notes}
              nextSteps={msg.nextSteps}
            />
          ))}

          {loading && (
            <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 24 }}>
              <Typography variant="body2">Thinking...</Typography>
            </div>
          )}
        </Box>
      </Box>

      {/* Input bar pinned to the bottom */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          px: 2,
          py: 2,
          flexShrink: 0
        }}
      >
        <Box sx={{ maxWidth: 820, mx: 'auto', display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Message Athena..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            fullWidth
            sx={{
              flexGrow: 1,
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& .MuiOutlinedInput-input': { color: '#0f172a' },
              '& .MuiOutlinedInput-input::placeholder': {
                color: '#64748b',
                opacity: 1
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? '...' : 'Send'}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // ------------------------------------------------------------------
  // DASHBOARD PAGE
  // ------------------------------------------------------------------
  const renderDashboardPage = () => (
    <Box>
      <Button
        variant="text"
        startIcon={<HomeIcon />}
        onClick={() => setPage('landing')}
        sx={{ mb: 2 }}
      >
        Home
      </Button>

      <KPICards />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
          mb: 2
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dashboard Insights
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ChatIcon />}
          onClick={() => setPage('chat')}
        >
          Open Chatbot
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {insights.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No insights pinned yet. Open the chatbot, ask questions, and they will
            appear here.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {insights.map((insight) => (
              <Grid item xs={12} md={6} key={insight.id}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {insight.title}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => unpinInsight(insight.id)}
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {insight.summary}
                  </Typography>

                  {insight.chart_or_table_ref &&
                  insight.chart_or_table_ref.chart_type ? (
                    <ResponsiveContainer width="100%" height={200}>
                      {insight.chart_or_table_ref.chart_type === "bar" ? (
                        <BarChart data={insight.chart_or_table_ref.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={insight.chart_or_table_ref.x} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey={insight.chart_or_table_ref.y} fill="#1976d2" />
                        </BarChart>
                      ) : (
                        <LineChart data={insight.chart_or_table_ref.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={insight.chart_or_table_ref.x} />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey={insight.chart_or_table_ref.y}
                            stroke="#1976d2"
                            strokeWidth={3}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <div
                      style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        backgroundColor: '#fafafa',
                        padding: 8
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 500, mb: 1 }}>
                        Data
                      </Typography>
                      <pre style={{ textAlign: 'left', fontSize: '11px', margin: 0 }}>
                        {JSON.stringify(
                          insight.chart_or_table_ref || insight.detail || {},
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );

  if (page === 'landing') {
    return (
      <div className="App">
        <Landing onLaunch={() => setPage('dashboard')} onChat={() => setPage('chat')} />
      </div>
    );
  }

  if (page === 'chat') {
    return <div className="App">{renderChatPage()}</div>;
  }

  return (
    <div className="App">
      <Header />
      <Box sx={{ pt: 12, pb: 4, px: 3 }}>
        <Container maxWidth="lg">{renderDashboardPage()}</Container>
      </Box>
    </div>
  );
}

export default App;
