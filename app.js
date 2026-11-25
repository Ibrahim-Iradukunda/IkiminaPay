const express = require('express');
const path = require('path');
const groupRoutes = require('./routes/groups');
const { checkDatabase } = require('./data/database');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Readiness check used by Docker, Ansible and humans: 200 only if PostgreSQL answers.
app.get('/health', async (_request, response) => {
  try {
    await checkDatabase();
    return response.status(200).json({ status: 'ok', database: 'up' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    return response.status(503).json({ status: 'error', database: 'down' });
  }
});
app.use('/groups', groupRoutes);

app.use((error, request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return response.status(400).json({ error: 'Request body must be valid JSON' });
  }

  console.error(error);
  return response.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : 'Internal server error'
  });
});

module.exports = app;
