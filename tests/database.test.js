const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  pool,
  buildSslConfig,
  missingConfig,
  checkDatabase,
  initSchema
} = require('../data/database');

describe('database configuration', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('reports missing required variables', () => {
    expect(missingConfig({ DB_HOST: 'localhost', DB_NAME: 'ikiminapay' }))
      .toEqual(['DB_USER', 'DB_PASSWORD']);
  });

  test('reports nothing when all required variables are set', () => {
    expect(missingConfig({
      DB_HOST: 'localhost',
      DB_NAME: 'ikiminapay',
      DB_USER: 'user',
      DB_PASSWORD: 'placeholder'
    })).toEqual([]);
  });

  test('disables SSL only when DB_SSL is false', () => {
    expect(buildSslConfig({ DB_SSL: 'false' })).toBe(false);
  });

  test('uses SSL by default when DB_SSL is not set (RDS requires it)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(buildSslConfig({ DB_SSL_CA: 'does/not/exist.pem' }))
      .toEqual({ rejectUnauthorized: false });

    warn.mockRestore();
  });

  test('exports the pool itself so require(...).query works', () => {
    expect(typeof require('../data/database').query).toBe('function');
  });

  test('verifies the server certificate when a CA bundle exists', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ikiminapay-ca-'));
    const caPath = path.join(directory, 'ca.pem');
    fs.writeFileSync(caPath, 'fake-ca');

    expect(buildSslConfig({ DB_SSL: 'true', DB_SSL_CA: caPath }))
      .toEqual({ ca: 'fake-ca', rejectUnauthorized: true });

    fs.rmSync(directory, { recursive: true, force: true });
  });

  test('falls back to encrypted, unverified SSL when the CA file is missing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(buildSslConfig({ DB_SSL: 'true', DB_SSL_CA: 'does/not/exist.pem' }))
      .toEqual({ rejectUnauthorized: false });
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});

describe('database helpers', () => {
  test('checkDatabase runs SELECT 1', async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };

    await checkDatabase(db);

    expect(db.query).toHaveBeenCalledWith('SELECT 1');
  });

  test('initSchema runs schema.sql with CREATE TABLE IF NOT EXISTS', async () => {
    const db = { query: jest.fn().mockResolvedValue({}) };

    await initSchema(db);

    const sql = db.query.mock.calls[0][0];
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS groups');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS members');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS contributions');
  });
});
