"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = exports.AccountService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const config_1 = __importDefault(require("../config"));
class AccountService {
    async getAllAccounts(userId) {
        if (!userId)
            throw new error_middleware_1.AppError('User ID is required', 400);
        const result = await (0, database_1.query)(`SELECT * FROM accounts 
       WHERE user_id = ? 
       ORDER BY is_active DESC, created_at DESC`, [userId]);
        return result.rows;
    }
    async getAccountById(userId, accountId) {
        if (!userId || !accountId) {
            throw new error_middleware_1.AppError('User ID and Account ID are required', 400);
        }
        const result = await (0, database_1.query)('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
        if (result.rows.length === 0) {
            throw new error_middleware_1.AppError('Account not found', 404);
        }
        return result.rows[0];
    }
    async createAccount(userId, data) {
        if (!userId)
            throw new error_middleware_1.AppError('User ID is required', 400);
        const { name, type, balance = 0, currency = 'USD', description = null } = data;
        const result = await (0, database_1.query)(`INSERT INTO accounts (user_id, name, type, balance, currency, description, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())`, [userId, name, type, balance, currency, description]);
        const insertId = result.insertId;
        if (!insertId)
            throw new error_middleware_1.AppError('Failed to create account', 500);
        const newAccount = await (0, database_1.query)('SELECT * FROM accounts WHERE id = ?', [insertId]);
        return newAccount.rows[0];
    }
    async updateAccount(userId, accountId, data) {
        config_1.default.debug('Starting updateAccount: ' + JSON.stringify({ userId, accountId }));
        if (!userId)
            throw new error_middleware_1.AppError('User ID is required', 400);
        if (!accountId)
            throw new error_middleware_1.AppError('Account ID is required', 400);
        // Verify account exists and belongs to user
        await this.getAccountById(userId, accountId);
        const updates = [];
        const values = [];
        if (data.name !== undefined) {
            updates.push(`name = ?`);
            values.push(data.name);
        }
        if (data.type !== undefined) {
            updates.push(`type = ?`);
            values.push(data.type);
        }
        if (data.balance !== undefined) {
            updates.push(`balance = ?`);
            values.push(data.balance);
        }
        if (data.description !== undefined) {
            updates.push(`description = ?`);
            values.push(data.description);
        }
        if (data.is_active !== undefined) {
            updates.push(`is_active = ?`);
            values.push(data.is_active);
        }
        if (updates.length === 0) {
            throw new error_middleware_1.AppError('No fields to update', 400);
        }
        updates.push('updated_at = NOW()');
        values.push(accountId, userId);
        config_1.default.debug('Executing update with ' + updates.length + ' fields');
        await (0, database_1.query)(`UPDATE accounts SET ${updates.join(', ')} 
       WHERE id = ? AND user_id = ?`, values);
        const result = await (0, database_1.query)('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
        if (result.rows.length === 0) {
            throw new error_middleware_1.AppError('Account not found after update', 404);
        }
        config_1.default.debug('Account updated: ' + result.rows[0].name);
        return result.rows[0];
    }
    async deleteAccount(userId, accountId) {
        if (!userId || !accountId) {
            throw new error_middleware_1.AppError('User ID and Account ID are required', 400);
        }
        const transactionsResult = await (0, database_1.query)('SELECT COUNT(*) as count FROM transactions WHERE account_id = ?', [accountId]);
        const count = Number(transactionsResult.rows[0]?.count || 0);
        if (count > 0) {
            throw new error_middleware_1.AppError('Cannot delete account with existing transactions. Please delete transactions first or deactivate the account.', 400);
        }
        const result = await (0, database_1.query)('DELETE FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
        if (result.rowCount === 0) {
            throw new error_middleware_1.AppError('Account not found', 404);
        }
    }
    async updateBalance(userId, accountId, amount, type) {
        if (!userId || !accountId) {
            throw new error_middleware_1.AppError('User ID and Account ID are required', 400);
        }
        const multiplier = type === 'income' ? 1 : -1;
        await (0, database_1.query)(`UPDATE accounts 
       SET balance = balance + (? * ?) 
       WHERE id = ? AND user_id = ?`, [amount, multiplier, accountId, userId]);
    }
}
exports.AccountService = AccountService;
exports.accountService = new AccountService();
//# sourceMappingURL=account.service.js.map