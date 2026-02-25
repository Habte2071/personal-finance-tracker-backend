import { query } from '../config/database';
import { Account, AccountCreateInput, AccountUpdateInput } from '../types';
import { AppError } from '../middleware/error.middleware';
import logger from '../config';

export class AccountService {
  async getAllAccounts(userId: number): Promise<Account[]> {
    if (!userId) throw new AppError('User ID is required', 400);
    const result = await query<Account>(
      `SELECT * FROM accounts 
       WHERE user_id = ? 
       ORDER BY is_active DESC, created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getAccountById(userId: number, accountId: number): Promise<Account> {
    if (!userId || !accountId) {
      throw new AppError('User ID and Account ID are required', 400);
    }
    const result = await query<Account>(
      'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
      [accountId, userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Account not found', 404);
    }
    return result.rows[0];
  }

  async createAccount(userId: number, data: AccountCreateInput): Promise<Account> {
    if (!userId) throw new AppError('User ID is required', 400);
    const { name, type, balance = 0, currency = 'USD', description = null } = data;

    const result = await query(
      `INSERT INTO accounts (user_id, name, type, balance, currency, description, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
      [userId, name, type, balance, currency, description]
    );

    const insertId = result.insertId;
    if (!insertId) throw new AppError('Failed to create account', 500);

    const newAccount = await query<Account>(
      'SELECT * FROM accounts WHERE id = ?',
      [insertId]
    );
    return newAccount.rows[0];
  }

  async updateAccount(
    userId: number,
    accountId: number,
    data: AccountUpdateInput
  ): Promise<Account> {
    logger.debug('Starting updateAccount: ' + JSON.stringify({ userId, accountId }));

    if (!userId) throw new AppError('User ID is required', 400);
    if (!accountId) throw new AppError('Account ID is required', 400);

    // Verify account exists and belongs to user
    await this.getAccountById(userId, accountId);

    const updates: string[] = [];
    const values: unknown[] = [];

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
      throw new AppError('No fields to update', 400);
    }

    updates.push('updated_at = NOW()');
    values.push(accountId, userId);

    logger.debug('Executing update with ' + updates.length + ' fields');

    await query(
      `UPDATE accounts SET ${updates.join(', ')} 
       WHERE id = ? AND user_id = ?`,
      values
    );

    const result = await query<Account>(
      'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
      [accountId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Account not found after update', 404);
    }

    logger.debug('Account updated: ' + result.rows[0].name);
    return result.rows[0];
  }

  async deleteAccount(userId: number, accountId: number): Promise<void> {
    if (!userId || !accountId) {
      throw new AppError('User ID and Account ID are required', 400);
    }

    const transactionsResult = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE account_id = ?',
      [accountId]
    );
    const count = Number(transactionsResult.rows[0]?.count || 0);
    if (count > 0) {
      throw new AppError(
        'Cannot delete account with existing transactions. Please delete transactions first or deactivate the account.',
        400
      );
    }

    const result = await query(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [accountId, userId]
    );
    if (result.rowCount === 0) {
      throw new AppError('Account not found', 404);
    }
  }

  async updateBalance(
    userId: number,
    accountId: number,
    amount: number,
    type: 'income' | 'expense'
  ): Promise<void> {
    if (!userId || !accountId) {
      throw new AppError('User ID and Account ID are required', 400);
    }
    const multiplier = type === 'income' ? 1 : -1;
    await query(
      `UPDATE accounts 
       SET balance = balance + (? * ?) 
       WHERE id = ? AND user_id = ?`,
      [amount, multiplier, accountId, userId]
    );
  }
}

export const accountService = new AccountService();