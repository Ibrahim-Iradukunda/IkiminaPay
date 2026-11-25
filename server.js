require('dotenv').config();

const { setTimeout: wait } = require('node:timers/promises');
const app = require('./app');
const { missingConfig, initSchema } = require('./data/database');

const port = Number(process.env.PORT) || 3000;
const attempts = Number(process.env.DB_CONNECT_RETRIES) || 5;
const retryDelayMs = 3000;

// The database may still be starting (e.g. in Docker Compose), so retry a few times.
async function prepareDatabase() {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await initSchema();
      console.log('Database is reachable and tables are ready.');
      return;
    } catch (error) {
      console.error(`Database not ready (attempt ${attempt}/${attempts}): ${error.message}`);
      if (attempt === attempts) throw error;
      await wait(retryDelayMs);
    }
  }
}

async function start() {
  const missing = missingConfig();
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  try {
    await prepareDatabase();
  } catch {
    console.error('Could not connect to PostgreSQL. Exiting so Docker/Ansible can see the failure.');
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`IkiminaPay API listening on port ${port}`);
  });
}

start();
