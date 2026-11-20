
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const caPath = process.env.DB_SSL_CA ||
  path.join(__dirname, '../certs/eu-north-1-bundle.pem');

const ca = fs.readFileSync(caPath, 'utf8');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    ca,
    rejectUnauthorized: true
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

module.exports = pool;
