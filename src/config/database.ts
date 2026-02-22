import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import logger from './index';

// Safely read password – convert to string and throw if missing
const rawPassword = process.env.DB_PASSWORD;
const password = rawPassword ? String(rawPassword) : '';

if (!password) {
  throw new Error(
    '❌ Database password is missing! Set DB_PASSWORD in your .env file.'
  );
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'personal_finance_db',
  user: process.env.DB_USER || 'postgres',
  password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  logger.info('✅ PostgreSQL pool connected');
});

pool.on('error', (err: Error) => {
  logger.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async <T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error', { error, query: text.substring(0, 100) });
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);

  client.query = async (...args: unknown[]) => {
    const start = Date.now();
    try {
      const result = await originalQuery(...args as [string, unknown[]]);
      const duration = Date.now() - start;
      // ✅ FIX: use optional chaining to avoid "Cannot read properties of undefined"
      logger.debug('Executed query with client', { duration, rows: result?.rowCount ?? 0 });
      return result;
    } catch (error) {
      logger.error('Client query error', { error });
      throw error;
    }
  };

  return client;
};

export const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;