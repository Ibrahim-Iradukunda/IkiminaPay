
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const ssl = process.env.DB_SSL?.toLowerCase() === 'false'
  ? false
  : {
      ca: fs.readFileSync(
        process.env.DB_SSL_CA || path.join(__dirname, '../certs/eu-north-1-bundle.pem'),
        'utf8'
      ),
      rejectUnauthorized: true
    };

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

module.exports = pool;
