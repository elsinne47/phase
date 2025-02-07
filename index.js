const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let votes = { jury: {}, peer: {} };

// Regular HTTP endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Get current votes
app.get('/votes', (req, res) => {
  res.json(votes);
});

// Update votes
app.post('/vote', (req, res) => {
  const { voterType, voterName, selectedTeam } = req.body;
  if (!votes[voterType]) {
    votes[voterType] = {};
  }
  votes[voterType][voterName] = selectedTeam;
  res.json(votes);
});

// Reset votes
app.post('/reset', (req, res) => {
  votes = { jury: {}, peer: {} };
  res.json(votes);
});

const server = app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send current votes to new client
  ws.send(JSON.stringify({ type: 'votes', data: votes }));

  ws.on('message', (message) => {
    try {
      console.log('Received:', message.toString());
      const data = JSON.parse(message);
      
      if (data.type === 'vote') {
        votes = data.votes;
        // Broadcast to all clients
        wss.clients.forEach(client => {
          client.send(JSON.stringify({ type: 'votes', data: votes }));
        });
      } else if (data.type === 'reset') {
        votes = { jury: {}, peer: {} };
        // Broadcast reset
        wss.clients.forEach(client => {
          client.send(JSON.stringify({ type: 'votes', data: votes }));
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
