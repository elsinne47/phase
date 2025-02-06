const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

let votes = {
  jury: {},
  peer: {}
};

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'votes', data: votes }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'vote') {
      votes = data.votes;
      wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: 'votes', data: votes }));
      });
    } else if (data.type === 'reset') {
      votes = { jury: {}, peer: {} };
      wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: 'votes', data: votes }));
      });
    }
  });
});
