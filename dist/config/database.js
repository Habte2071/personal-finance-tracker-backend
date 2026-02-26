"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = exports.getClient = exports.query = void 0;
const promise_1 = require("mysql2/promise");
const index_1 = __importDefault(require("./index"));
// Safely read password – allow empty string, but fail if variable is not set
const rawPassword = process.env.DB_PASSWORD;
if (rawPassword === undefined) {
    throw new Error('❌ Database password is missing! Set DB_PASSWORD in your .env file (can be empty).');
}
const password = String(rawPassword); // may be empty string
const pool = (0, promise_1.createPool)({
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
pool.on('connection', () => {
    index_1.default.info('✅ MySQL pool connected');
});
pool.on('error', (err) => {
    index_1.default.error('❌ Unexpected error on MySQL pool', err);
    process.exit(-1);
});
/**
 * Execute a query and return a result compatible with the old pg interface.
 * Returns an object with `rows`, `rowCount`, and optionally `insertId`.
 */
const query = async (sql, params) => {
    const start = Date.now();
    try {
        const [result] = await pool.execute(sql, params || []);
        const duration = Date.now() - start;
        // Check if result is a ResultSetHeader (for INSERT/UPDATE/DELETE)
        if (result && typeof result === 'object' && 'affectedRows' in result) {
            const header = result; // mysql2 ResultSetHeader
            index_1.default.debug('Executed query', { sql: sql.substring(0, 100), duration, affectedRows: header.affectedRows });
            return {
                rows: [],
                rowCount: header.affectedRows,
                insertId: header.insertId,
            };
        }
        // Otherwise, it's a SELECT – result is an array of rows
        const rows = Array.isArray(result) ? result : [];
        index_1.default.debug('Executed query', { sql: sql.substring(0, 100), duration, rows: rows.length });
        return { rows: rows, rowCount: rows.length };
    }
    catch (error) {
        index_1.default.error('Database query error', { error, query: sql.substring(0, 100) });
        throw error;
    }
};
exports.query = query;
/**
 * Get a connection from the pool for manual transactions.
 * Returns a connection whose `execute` method is wrapped for logging.
 */
const getClient = async () => {
    const connection = await pool.getConnection();
    const originalExecute = connection.execute.bind(connection);
    // Wrap execute to add logging – cast to any to bypass overload issues
    connection.execute = async (sql, params) => {
        const start = Date.now();
        try {
            const result = await originalExecute(sql, params || []);
            const duration = Date.now() - start;
            const rows = Array.isArray(result[0]) ? result[0] : [];
            index_1.default.debug('Executed query with client', { duration, rows: rows.length });
            return result;
        }
        catch (error) {
            index_1.default.error('Client query error', { error });
            throw error;
        }
    };
    return connection;
};
exports.getClient = getClient;
/**
 * Run a transaction with automatic commit/rollback.
 * Uses `query()` for transaction control statements to avoid prepared statement limitations.
 * The callback receives a client (connection) with an augmented execute method.
 */
const transaction = async (callback) => {
    const connection = await (0, exports.getClient)();
    try {
        await connection.query('START TRANSACTION');
        const result = await callback(connection);
        await connection.query('COMMIT');
        return result;
    }
    catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.transaction = transaction;
exports.default = pool;
//# sourceMappingURL=database.js.map