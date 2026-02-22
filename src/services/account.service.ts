import { query } from '../config/database';
import { Account, AccountCreateInput, AccountUpdateInput } from '../types';
import { AppError } from '../middleware/error.middleware';
import logger from '../config';
import crypto from 'crypto';

export class AccountService {
  async getAllAccounts(userId: string): Promise<Account[]> {
    if (!userId) throw new AppError('User ID is required', 400);
    const result = await query<Account>(
      `SELECT * FROM accounts 
       WHERE user_id = ? 
       ORDER BY is_active DESC, created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getAccountById(userId: string, accountId: string): Promise<Account> {
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

  async createAccount(userId: string, data: AccountCreateInput): Promise<Account> {
    if (!userId) throw new AppError('User ID is required', 400);
    const { name, type, balance = 0, currency = 'USD', description = null } = data;
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO accounts (id, user_id, name, type, balance, currency, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, name, type, balance, currency, description]
    );
    const result = await query<Account>(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );
    return result.rows[0];
  }

  async updateAccount(
    userId: string,
    accountId: string,
    data: AccountUpdateInput
  ): Promise<Account> {
    try {
      console.log('🟢 updateAccount called with:', { userId, accountId, data });

      if (!userId) throw new AppError('User ID is required', 400);
      if (!accountId) throw new AppError('Account ID is required', 400);

      // Verify account exists and belongs to user
      const existing = await this.getAccountById(userId, accountId);
      console.log('🟢 existing account:', existing);

      // Build dynamic UPDATE query
      const updates: string[] = [];
      const values: unknown[] = [];

      const addField = (field: string, value: unknown) => {
        if (value !== undefined) {
          updates.push(`${field} = ?`);
          values.push(value);
        }
      };

      addField('name', data.name);
      addField('type', data.type);
      addField('balance', data.balance);
      addField('description', data.description);
      addField('is_active', data.is_active);

      if (updates.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      // Append accountId and userId for WHERE clause
      values.push(accountId, userId);

      const queryText = `
        UPDATE accounts 
        SET ${updates.join(', ')} 
        WHERE id = ? AND user_id = ?
      `;

      console.log('🟢 queryText:', queryText);
      console.log('🟢 values:', values);

      await query(queryText, values);

      const result = await query<Account>(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Account not found after update', 404);
      }

      console.log('🟢 update successful, returning:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ updateAccount service error:', error);
      logger.error('Error in AccountService.updateAccount:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        data,
        userId,
        accountId,
      });
      throw error;
    }
  }

  async deleteAccount(userId: string, accountId: string): Promise<void> {
    if (!userId || !accountId) {
      throw new AppError('User ID and Account ID are required', 400);
    }

    const transactionsResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM transactions WHERE account_id = ?',
      [accountId]
    );
    const count = parseInt(transactionsResult.rows[0]?.count || '0', 10);
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
    if (result.rowsAffected === 0) {
      throw new AppError('Account not found', 404);
    }
  }

  async updateBalance(
    userId: string,
    accountId: string,
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