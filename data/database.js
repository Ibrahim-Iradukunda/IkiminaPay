const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Every connection setting comes from environment variables (see .env.example).
const REQUIRED_VARIABLES = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

// Lists the required database variables that are missing or empty.
function missingConfig(env = process.env) {
  return REQUIRED_VARIABLES.filter((name) => !env[name]);
}

const DEFAULT_CA_PATH = 'certs/eu-north-1-bundle.pem';

// SSL is ON by default, because RDS requires it (rds.force_ssl = 1).
// DB_SSL=false -> no SSL (only for local PostgreSQL in Docker).
// With SSL on: if a CA bundle exists (DB_SSL_CA, or certs/eu-north-1-bundle.pem),
// the server certificate is verified; otherwise the connection is still
// encrypted but the certificate is not verified (warning logged).
function buildSslConfig(env = process.env) {
  if (String(env.DB_SSL).toLowerCase() === 'false') {
    return false;
  }

  const caPath = path.resolve(__dirname, '..', env.DB_SSL_CA || DEFAULT_CA_PATH);

  if (fs.existsSync(caPath)) {
    return { ca: fs.readFileSync(caPath, 'utf8'), rejectUnauthorized: true };
  }

  if (env.DB_SSL_CA) {
    console.warn(`DB_SSL_CA file not found at ${caPath}.`);
  }

  console.warn('DB_SSL is on without a CA bundle: the connection is encrypted, but the server certificate is not verified.');
  return { rejectUnauthorized: false };
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: buildSslConfig(),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// An idle client losing its connection must not crash the whole app.
pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

// Cheap query used by GET /health. Rejects if the database is unreachable.
async function checkDatabase(db = pool) {
  await db.query('SELECT 1');
}

// Creates the tables on startup. schema.sql only uses IF NOT EXISTS,
// so running it every time the app starts is safe.
async function initSchema(db = pool) {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await db.query(schema);
}

// The pool itself is exported so `require('./data/database').query(...)` keeps
// working (the Ansible schema task uses it). Helpers are attached as properties.
module.exports = Object.assign(pool, {
  pool,
  buildSslConfig,
  missingConfig,
  checkDatabase,
  initSchema
});
