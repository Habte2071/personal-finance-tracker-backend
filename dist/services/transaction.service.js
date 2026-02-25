"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const config_1 = __importDefault(require("../config"));
class TransactionService {
    async getTransactions(userId, filters) {
        const { startDate, endDate, accountId, categoryId, type, minAmount, maxAmount, page = 1, limit = 20, } = filters;
        let whereClause = 'WHERE t.user_id = ?';
        const params = [userId];
        if (startDate) {
            whereClause += ` AND t.transaction_date >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ` AND t.transaction_date <= ?`;
            params.push(endDate);
        }
        if (accountId) {
            whereClause += ` AND t.account_id = ?`;
            params.push(accountId);
        }
        if (categoryId) {
            whereClause += ` AND t.category_id = ?`;
            params.push(categoryId);
        }
        if (type) {
            whereClause += ` AND t.type = ?`;
            params.push(type);
        }
        if (minAmount !== undefined) {
            whereClause += ` AND t.amount >= ?`;
            params.push(minAmount);
        }
        if (maxAmount !== undefined) {
            whereClause += ` AND t.amount <= ?`;
            params.push(maxAmount);
        }
        const countResult = await (0, database_1.query)(`SELECT COUNT(*) as count FROM transactions t ${whereClause}`, params);
        const total = Number(countResult.rows[0].count);
        const offset = (page - 1) * limit;
        const paginatedParams = [...params, limit, offset];
        const result = await (0, database_1.query)(`SELECT 
        t.*,
        a.name as account_name,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN categories c ON t.category_id = c.id
       ${whereClause}
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`, paginatedParams);
        return {
            transactions: result.rows,
            total,
        };
    }
    async getTransactionById(userId, transactionId) {
        const result = await (0, database_1.query)(`SELECT 
        t.*,
        a.name as account_name,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ? AND t.user_id = ?`, [transactionId, userId]);
        if (result.rows.length === 0) {
            throw new error_middleware_1.AppError('Transaction not found', 404);
        }
        return result.rows[0];
    }
    async createTransaction(userId, data) {
        const accountResult = await (0, database_1.query)('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [data.account_id, userId]);
        if (accountResult.rows.length === 0) {
            throw new error_middleware_1.AppError('Account not found', 404);
        }
        if (typeof data.amount !== 'number' || isNaN(data.amount) || !isFinite(data.amount)) {
            throw new error_middleware_1.AppError('Amount must be a valid number', 400);
        }
        let categoryId = null;
        if (data.category_id) {
            const categoryResult = await (0, database_1.query)('SELECT id FROM categories WHERE id = ? AND (user_id = ? OR is_default = true)', [data.category_id, userId]);
            if (categoryResult.rows.length === 0) {
                throw new error_middleware_1.AppError('Category not found', 404);
            }
            categoryId = data.category_id;
        }
        return await (0, database_1.transaction)(async (client) => {
            const [insertResult] = await client.execute(`INSERT INTO transactions 
         (user_id, account_id, category_id, type, amount, description, transaction_date, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [userId, data.account_id, categoryId, data.type, data.amount, data.description, data.transaction_date, data.notes || null]);
            const insertId = insertResult.insertId;
            if (!insertId)
                throw new error_middleware_1.AppError('Failed to create transaction', 500);
            const netChange = data.type === 'income' ? data.amount : -data.amount;
            await client.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [netChange, data.account_id]);
            // Fetch the created transaction using the client connection
            const [transactionRows] = await client.execute(`SELECT 
          t.*,
          a.name as account_name,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
         FROM transactions t
         LEFT JOIN accounts a ON t.account_id = a.id
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.id = ?`, [insertId]);
            const rows = transactionRows;
            return rows[0];
        });
    }
    async updateTransaction(userId, transactionId, data) {
        config_1.default.debug('Starting updateTransaction:', { userId, transactionId, data });
        if (!transactionId || transactionId <= 0) {
            throw new error_middleware_1.AppError('Invalid transaction ID', 400);
        }
        // Get existing transaction BEFORE starting the transaction
        const existingTransaction = await this.getTransactionById(userId, transactionId);
        config_1.default.debug('Found existing transaction:', existingTransaction);
        return await (0, database_1.transaction)(async (client) => {
            try {
                // Revert old balance
                const oldNetChange = existingTransaction.type === 'income' ? existingTransaction.amount : -existingTransaction.amount;
                await client.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [oldNetChange, existingTransaction.account_id]);
                const updates = [];
                const values = [];
                if (data.account_id !== undefined) {
                    updates.push(`account_id = ?`);
                    values.push(data.account_id);
                }
                if (data.category_id !== undefined) {
                    updates.push(`category_id = ?`);
                    values.push(data.category_id);
                }
                if (data.type !== undefined) {
                    updates.push(`type = ?`);
                    values.push(data.type);
                }
                if (data.amount !== undefined) {
                    updates.push(`amount = ?`);
                    values.push(data.amount);
                }
                if (data.description !== undefined) {
                    updates.push(`description = ?`);
                    values.push(data.description);
                }
                if (data.transaction_date !== undefined) {
                    updates.push(`transaction_date = ?`);
                    values.push(data.transaction_date);
                }
                if (data.notes !== undefined) {
                    updates.push(`notes = ?`);
                    values.push(data.notes);
                }
                if (updates.length === 0) {
                    throw new error_middleware_1.AppError('No fields to update', 400);
                }
                values.push(transactionId, userId);
                await client.execute(`UPDATE transactions SET ${updates.join(', ')}, updated_at = NOW() 
           WHERE id = ? AND user_id = ?`, values);
                // Fetch updated transaction using client connection
                const [updatedRows] = await client.execute(`SELECT 
            t.*,
            a.name as account_name,
            c.name as category_name,
            c.color as category_color,
            c.icon as category_icon
           FROM transactions t
           LEFT JOIN accounts a ON t.account_id = a.id
           LEFT JOIN categories c ON t.category_id = c.id
           WHERE t.id = ? AND t.user_id = ?`, [transactionId, userId]);
                const rows = updatedRows;
                if (rows.length === 0) {
                    throw new error_middleware_1.AppError('Transaction not found after update', 404);
                }
                const updatedTransaction = rows[0];
                // Apply new balance
                const newNetChange = updatedTransaction.type === 'income' ? updatedTransaction.amount : -updatedTransaction.amount;
                await client.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [newNetChange, updatedTransaction.account_id]);
                return updatedTransaction;
            }
            catch (dbError) {
                config_1.default.error('Database error in updateTransaction:', dbError);
                throw new error_middleware_1.AppError('Failed to update transaction: ' + dbError.message, 500);
            }
        });
    }
    async deleteTransaction(userId, transactionId) {
        const tx = await this.getTransactionById(userId, transactionId);
        await (0, database_1.transaction)(async (client) => {
            const netChange = tx.type === 'income' ? tx.amount : -tx.amount;
            await client.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [netChange, tx.account_id]);
            await client.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId]);
        });
    }
    async getTransactionSummary(userId, startDate, endDate) {
        const result = await (0, database_1.query)(`SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as transaction_count
       FROM transactions
       WHERE user_id = ? AND transaction_date BETWEEN ? AND ?`, [userId, startDate, endDate]);
        return {
            total_income: parseFloat(result.rows[0].total_income),
            total_expense: parseFloat(result.rows[0].total_expense),
            transaction_count: parseInt(result.rows[0].transaction_count, 10),
            net_savings: parseFloat(result.rows[0].total_income) - parseFloat(result.rows[0].total_expense),
        };
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
//# sourceMappingURL=transaction.service.js.map