const express = require('express');
const path = require('path');
const groupRoutes = require('./routes/groups');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/groups', groupRoutes);

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return response.status(400).json({ error: 'Request body must be valid JSON' });
  }

  console.error(error);
  return response.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : 'Internal server error'
  });
});

module.exports = app;
