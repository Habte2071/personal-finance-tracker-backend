import { Pool, PoolConnection } from 'mysql2/promise';
declare const pool: Pool;
/**
 * Execute a query and return a result compatible with the old pg interface.
 * Returns an object with `rows`, `rowCount`, and optionally `insertId`.
 */
export declare const query: <T = any>(sql: string, params?: any[]) => Promise<{
    rows: T[];
    rowCount: number;
    insertId?: number;
}>;
/**
 * Get a connection from the pool for manual transactions.
 * Returns a connection whose `execute` method is wrapped for logging.
 */
export declare const getClient: () => Promise<PoolConnection>;
/**
 * Run a transaction with automatic commit/rollback.
 * Uses `query()` for transaction control statements to avoid prepared statement limitations.
 * The callback receives a client (connection) with an augmented execute method.
 */
export declare const transaction: <T>(callback: (client: PoolConnection) => Promise<T>) => Promise<T>;
export default pool;
//# sourceMappingURL=database.d.ts.map