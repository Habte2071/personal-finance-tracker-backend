import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import logger from './index';

// Safely read password – allow empty string, but fail if variable is not set
const rawPassword = process.env.DB_PASSWORD;
if (rawPassword === undefined) {
  throw new Error(
    '❌ Database password is missing! Set DB_PASSWORD in your .env file (can be empty).'
  );
}
const password = String(rawPassword); // may be empty string

const pool: Pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'personal_finance_db',
  user: process.env.DB_USER || 'root',
  password,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// TypeScript workaround for pool event listeners
(pool as any).on('connection', () => {
  logger.info('✅ MySQL pool connected');
});

(pool as any).on('error', (err: Error) => {
  logger.error('❌ Unexpected error on MySQL pool', err);
  process.exit(-1);
});

/**
 * Execute a query and return a result compatible with the old pg interface.
 * Returns an object with `rows` and `rowCount` properties.
 */
export const query = async <T = any>(
  sql: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number; [key: string]: any }> => {
  const start = Date.now();
  try {
    // Ensure params is an array (default to empty array if undefined)
    const [rows] = await pool.execute(sql, params || []);
    const duration = Date.now() - start;
    const rowCount = Array.isArray(rows) ? rows.length : 0;
    logger.debug('Executed query', { sql: sql.substring(0, 100), duration, rows: rowCount });
    return { rows: rows as T[], rowCount };
  } catch (error) {
    logger.error('Database query error', { error, query: sql.substring(0, 100) });
    throw error;
  }
};

/**
 * Get a connection from the pool for manual transactions.
 * Returns a connection whose `execute` method is wrapped for logging.
 */
export const getClient = async (): Promise<PoolConnection> => {
  const connection = await pool.getConnection();
  const originalExecute = connection.execute.bind(connection);

  // Wrap execute to add logging – cast to any to bypass overload issues
  (connection as any).execute = async (sql: string, params?: any[]) => {
    const start = Date.now();
    try {
      // Ensure params is an array (default to empty array if undefined)
      const result = await originalExecute(sql, params || []);
      const duration = Date.now() - start;
      const rows = Array.isArray(result[0]) ? result[0] : [];
      logger.debug('Executed query with client', { duration, rows: rows.length });
      return result;
    } catch (error) {
      logger.error('Client query error', { error });
      throw error;
    }
  };

  return connection;
};

/**
 * Run a transaction with automatic commit/rollback.
 * Uses `query()` for transaction control statements to avoid prepared statement limitations.
 * The callback receives a client (connection) with an augmented execute method.
 */
export const transaction = async <T>(
  callback: (client: PoolConnection) => Promise<T>
): Promise<T> => {
  const connection = await getClient();
  try {
    // Use query() instead of execute() for transaction control commands
    await connection.query('START TRANSACTION');
    const result = await callback(connection);
    await connection.query('COMMIT');
    return result;
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;