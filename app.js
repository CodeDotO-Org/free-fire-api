const { topupFreeFire } = require('./libs/topup');
const { port } = require('./utilities/dev');
const express = require('express');

const app = express();
const api = express();

app.use(express.json());

// Global request counter
let requestCounter = 0;
let lastResetTime = Date.now();
const WINDOW_TIME = 13 * 1000; // 13 seconds
const MAX_REQUESTS = 3;

// Middleware to enforce rate limiting
app.use((req, res, next) => {
  const currentTime = Date.now();

  // Reset counter if the time window has passed
  if (currentTime - lastResetTime > WINDOW_TIME) {
    requestCounter = 0;
    lastResetTime = currentTime;
  }

  if (requestCounter < MAX_REQUESTS) {
    requestCounter++; // Allow the request and increment the counter
    next();
  } else {
    res.status(429).json({
      status: 429,
      message: 'Too many requests. Please wait and try again.',
    });
  }
});

app.use('/api', api);

// middleware
app.use((req, res, next) => {
  return next();
});

api.get('/topup', topupFreeFire);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
