import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Container,
  Typography,
  Button,
  TextField,
  Box
} from "@mui/material";

import Header from "./components/Header";
import MessageBubble from "./components/messagebubble";
import Landing from "./components/Landing";
import DatabaseExplorer from "./components/DatabaseExplorer";
import TableView from "./components/TableView";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';

import { backendUrl } from "./config";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Which page is showing: 'landing', 'dashboard', 'chat', or 'table'.
  const [page, setPage] = useState('landing');
  // When on the 'table' page, which table is open.
  const [activeTable, setActiveTable] = useState(null);

  const openTable = (name) => {
    setActiveTable(name);
    setPage('table');
  };

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
        bgcolor: '#0b1220',
        color: '#e2e8f0'
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
          bgcolor: '#111a2b',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
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
          bgcolor: '#111a2b',
          borderTop: '1px solid rgba(255,255,255,0.08)',
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button
          variant="text"
          startIcon={<HomeIcon />}
          onClick={() => setPage('landing')}
        >
          Home
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<ChatIcon />}
          onClick={() => setPage('chat')}
        >
          Open Chatbot
        </Button>
      </Box>

      <DatabaseExplorer onSelectTable={openTable} />
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

  if (page === 'table') {
    return (
      <div className="App">
        <TableView tableName={activeTable} onBack={() => setPage('dashboard')} />
      </div>
    );
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
