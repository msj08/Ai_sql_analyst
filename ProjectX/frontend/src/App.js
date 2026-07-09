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
  Grid,
  Card,
  CardContent,
  Chip
} from "@mui/material";

import Header from "./components/Header";
import KPICards from "./components/kpicards";
import MessageBubble from "./components/messagebubble";
import CloseIcon from '@mui/icons-material/Close';

// Copy text to the clipboard. navigator.clipboard only exists in a secure
// context (HTTPS or localhost); fall back to a temporary textarea otherwise
// so this never throws on a plain-http LAN address.
const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => {});
    return;
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand("copy");
  } catch (e) {
    // ignore — clipboard simply isn't available
  }
  document.body.removeChild(el);
};


function App() {

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const [backendUrl] = useState('http://localhost:8000');


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


      const response = await axios.post(
        `${backendUrl}/chat`,
        {
          message: currentInput
        }
      );


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


      console.error(
        'Error sending message:',
        error
      );


      const errorMessage = {

        id: Date.now() + 1,

        text:
          'Sorry, I encountered an error processing your request.',

        sender: 'bot',

        timestamp: new Date(),

        error: true

      };


      setMessages(prev => [
        ...prev,
        errorMessage
      ]);


    } finally {

      setLoading(false);

    }

  };



  const loadInsights = async () => {

    try {

      const response = await axios.get(
        `${backendUrl}/dashboard/insights`
      );

      setInsights(
        response.data.insights
      );


    } catch (error) {

      console.error(
        'Error loading insights:',
        error
      );

    }

  };



  const unpinInsight = async (id) => {

    try {

      await axios.delete(
        `${backendUrl}/dashboard/insights/${id}`
      );

      loadInsights();


    } catch (error) {

      console.error(
        'Error unpinning insight:',
        error
      );

    }

  };



  useEffect(() => {

    loadInsights();

  }, []);



  useEffect(() => {

    const chatContainer =
      document.getElementById(
        'chat-messages'
      );


    if (chatContainer) {

      chatContainer.scrollTop =
        chatContainer.scrollHeight;

    }

  }, [messages]);



  return (

    <div className="App">


    
<Header />

<Box
  sx={{
    pt: 12,
    pb: 4,
    px: 3
  }}
>

<KPICards />

        <Container maxWidth="lg">


          <Grid container spacing={3}>


            {/* CHAT COLUMN */}


            <Grid item xs={12} md={8}>


            
                <Paper
                  sx={{
                    p: 3,
                    height: "60vh",
                    overflowY: "auto",
                    borderRadius: 5,
                    background: "linear-gradient(180deg, #111827, #1f2937)",
                    color: "white",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.35)"
                  }}
                >

          


                <Typography
                  variant="h6"
                  gutterBottom
                >

                  Chat with Athena

                </Typography>



                <div
                  id="chat-messages"
                  style={{
                    height:'100%',
                    overflowY:'auto'
                  }}
                >


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
    <div
      style={{
        textAlign: "center",
        paddingTop: 32,
        paddingBottom: 32
      }}
    >
      <Typography variant="body2">
        Thinking...
      </Typography>
    </div>
  )}
</div>     


                  {loading && (

                    <div
                      style={{
                        textAlign:'center',
                        paddingTop:32,
                        paddingBottom:32
                      }}
                    >

                      <Typography
                        variant="body2"
                      >

                        Thinking...

                      </Typography>


                    </div>

                  )}


      </Paper>



              <Box
                sx={{
                  mt:3,
                  display:'flex',
                  gap:2
                }}
              >

                <TextField

                  placeholder="Ask Athena a question about your data..."

                  value={inputValue}

                  onChange={
                    (e)=>setInputValue(e.target.value)
                  }

                  onKeyPress={
                    (e)=>
                      e.key === 'Enter'
                      && sendMessage()
                  }

                  sx={{
                    flexGrow:1
                  }}

                  fullWidth

                  InputLabelProps={{
                    shrink:true
                  }}

                />


                <Button

                  variant="contained"

                  color="primary"

                  onClick={sendMessage}

                  disabled={loading}

                >

                  {
                    loading
                    ? 'Thinking...'
                    : 'Ask'
                  }

                </Button>


              </Box>



            </Grid>





            {/* DASHBOARD COLUMN */}



            <Grid
              item
              xs={12}
              md={4}
            >


              <Paper
                sx={{
                  p:3
                }}
              >


                <Typography
                  variant="h6"
                  gutterBottom
                >

                  Dashboard Insights

                </Typography>




                {
                  insights.length === 0

                  ?


                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >

                    No insights pinned yet. Ask questions and pin insights to see them here.

                  </Typography>


                  :



                  <Grid
                    container
                    spacing={3}
                  >


                    {
                      insights.map(insight=>(


                        <Grid
                          item
                          xs={12}
                          key={insight.id}
                        >


                          <Paper
                            sx={{
                              p:2,
                              mb:2
                            }}
                          >


                            <Box
                              sx={{
                                display:'flex',
                                justifyContent:'space-between',
                                alignItems:'center',
                                mb:2
                              }}
                            >


                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight:600
                                }}
                              >

                                {insight.title}

                              </Typography>


                              <Button

                                size="small"

                                variant="text"

                                color="error"

                                onClick={
                                  ()=>unpinInsight(insight.id)
                                }

                              >

                                <CloseIcon
                                  fontSize="small"
                                />

                              </Button>


                            </Box>





                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb:2
                              }}
                            >

                              {insight.summary}

                            </Typography>





                            {/* CHANGE 3 - REAL DASHBOARD CHART */}



                            {
                              insight.chart_or_table_ref &&
                              insight.chart_or_table_ref.chart_type

                              ?


                              <ResponsiveContainer
                                width="100%"
                                height={200}
                              >


                                {
                                  insight.chart_or_table_ref.chart_type === "bar"

                                  ?


                                  <BarChart
                                    data={
                                      insight.chart_or_table_ref.data
                                    }
                                  >

                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                    />


                                    <XAxis
                                      dataKey={
                                        insight.chart_or_table_ref.x
                                      }
                                    />


                                    <YAxis />


                                    <Tooltip />



                                    <Bar

                                      dataKey={
                                        insight.chart_or_table_ref.y
                                      }

                                      fill="#1976d2"

                                    />


                                  </BarChart>


                                  :


                                  <LineChart
                                    data={
                                      insight.chart_or_table_ref.data
                                    }
                                  >

                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                    />


                                    <XAxis
                                      dataKey={
                                        insight.chart_or_table_ref.x
                                      }
                                    />


                                    <YAxis />


                                    <Tooltip />



                                    <Line

                                      type="monotone"

                                      dataKey={
                                        insight.chart_or_table_ref.y
                                      }

                                      stroke="#1976d2"

                                      strokeWidth={3}

                                    />


                                  </LineChart>


                                }


                              </ResponsiveContainer>


                              :


                              <div
                                style={{
                                  maxHeight:'150px',
                                  overflowY:'auto',
                                  backgroundColor:'#fafafa',
                                  padding:8
                                }}
                              >

                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight:500,
                                    mb:1
                                  }}
                                >

                                  Data

                                </Typography>


                                <pre
                                  style={{
                                    textAlign:'left',
                                    fontSize:'11px',
                                    margin:0
                                  }}
                                >

                                  {
                                    JSON.stringify(
                                      insight.chart_or_table_ref || insight.detail || {},
                                      null,
                                      2
                                    )
                                  }

                                </pre>


                              </div>

                            }






                            <Box
                              sx={{
                                mt:2,
                                p:1,
                                bgcolor:'grey.50',
                                borderRadius:1
                              }}
                            >

                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight:500,
                                  mb:1
                                }}
                              >

                                SQL

                              </Typography>


                              <Button

                                size="small"

                                variant="text"

                                onClick={
                                  () => copyToClipboard(insight.sql)
                                }

                              >

                                Copy SQL

                              </Button>



                              <Typography

                                variant="body2"

                                color="text.secondary"

                                sx={{
                                  wordBreak:'break-all',
                                  fontSize:'11px',
                                  display:'block',
                                  mt:1
                                }}

                              >

                                {
                                  insight.sql.length > 100
                                  ? insight.sql.substring(0,100)+'...'
                                  : insight.sql
                                }


                              </Typography>


                            </Box>




                          </Paper>


                        </Grid>


                      ))
                    }


                  </Grid>


                }



              </Paper>


            </Grid>


          </Grid>


        </Container>


      </Box>


    </div>

  );


}


export default App;