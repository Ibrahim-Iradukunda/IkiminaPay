const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function initializeDatabase() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
  } finally {
    await pool.end();
  }
}

initializeDatabase().catch((error) => {
  console.error('Database schema initialization failed:', error.message);
  process.exitCode = 1;
});
