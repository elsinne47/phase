const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let votes = { jury: {}, peer: {} };

// Get votes
app.get('/votes', (req, res) => {
  res.json(votes);
});

// Cast vote
app.post('/vote', (req, res) => {
  const { type, name, selectedTeam } = req.body;
  if (!votes[type]) votes[type] = {};
  votes[type][name] = selectedTeam;
  res.json(votes);
});

// Reset votes
app.post('/reset', (req, res) => {
  votes = { jury: {}, peer: {} };
  res.json(votes);
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
