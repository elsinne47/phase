const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(process.env.PORT || 3001);
const wss = new WebSocketServer({ 
  server,
  path: "/ws" // Add this line
});

let votes = { jury: {}, peer: {} };

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'votes', data: votes }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'vote') {
        votes = data.votes;
        wss.clients.forEach(client => {
          client.send(JSON.stringify({ type: 'votes', data: votes }));
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
