const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['Content-Security-Policy']
}));

// Add these lines after the CORS middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "connect-src 'self' https://phase-production.up.railway.app");
  next();
});

app.use(express.json());

let votes = { jury: {}, peer: {} };

// Get votes
app.get('/votes', (req, res) => {
  console.log('GET /votes request received');
  res.json(votes);
});

// Cast vote
app.post('/vote', (req, res) => {
  console.log('POST /vote request received:', req.body);
  const { type, name, selectedTeam } = req.body;
  if (!votes[type]) votes[type] = {};
  votes[type][name] = selectedTeam;
  res.json(votes);
});

// Reset votes
app.post('/reset', (req, res) => {
  console.log('POST /reset request received');
  votes = { jury: {}, peer: {} };
  res.json(votes);
});

app.get('/', (req, res) => {
  res.send('Voting Server is running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
