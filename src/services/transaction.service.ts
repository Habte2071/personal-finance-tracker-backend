import { query, transaction } from '../config/database';
import { Transaction, TransactionCreateInput, TransactionUpdateInput, TransactionFilters } from '../types';
import { AppError } from '../middleware/error.middleware';
import crypto from 'crypto';
import { PoolConnection } from 'mysql2/promise';

export class TransactionService {
  async getTransactions(userId: string, filters: TransactionFilters): Promise<{ transactions: Transaction[]; total: number }> {
    const {
      startDate,
      endDate,
      accountId,
      categoryId,
      type,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
    } = filters;

    let whereClause = 'WHERE t.user_id = ?';
    const params: unknown[] = [userId];

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

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM transactions t ${whereClause}`,
      params as any[]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get transactions with pagination
    const offset = (page - 1) * limit;
    const paginatedParams = [...params, limit, offset];

    const result = await query<Transaction>(
      `SELECT 
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
       LIMIT ? OFFSET ?`,
      paginatedParams as any[]
    );

    return {
      transactions: result.rows,
      total,
    };
  }

  async getTransactionById(userId: string, transactionId: string): Promise<Transaction> {
    const result = await query<Transaction>(
      `SELECT 
        t.*,
        a.name as account_name,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, userId] as any[]
    );

    if (result.rows.length === 0) {
      throw new AppError('Transaction not found', 404);
    }

    return result.rows[0];
  }

  async createTransaction(userId: string, data: TransactionCreateInput): Promise<Transaction> {
    // Validate account_id
    if (!data.account_id || data.account_id.trim() === '') {
      throw new AppError('Account ID is required', 400);
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.account_id)) {
      throw new AppError('Invalid account ID format', 400);
    }

    // Validate account ownership
    const accountResult = await query(
      'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
      [data.account_id, userId] as any[]
    );
    if (accountResult.rows.length === 0) {
      throw new AppError('Account not found', 404);
    }

    // Validate amount is a finite number
    if (typeof data.amount !== 'number' || isNaN(data.amount) || !isFinite(data.amount)) {
      throw new AppError('Amount must be a valid number', 400);
    }

    // Handle optional category
    let categoryId: string | null = null;
    if (data.category_id) {
      if (!uuidRegex.test(data.category_id)) {
        throw new AppError('Invalid category ID format', 400);
      }
      const categoryResult = await query(
        'SELECT id FROM categories WHERE id = ? AND (user_id = ? OR is_default = true)',
        [data.category_id, userId] as any[]
      );
      if (categoryResult.rows.length === 0) {
        throw new AppError('Category not found', 404);
      }
      categoryId = data.category_id;
    }

    const id = crypto.randomUUID();

    return await transaction(async (client) => {
      try {
        // Insert transaction
        await client.execute(
          `INSERT INTO transactions 
           (id, user_id, account_id, category_id, type, amount, description, transaction_date, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, userId, data.account_id, categoryId, data.type, data.amount, data.description, data.transaction_date, data.notes || null] as any[]
        );

        // Compute net change and update account balance
        const netChange = data.type === 'income' ? data.amount : -data.amount;
        await client.execute(
          'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          [netChange, data.account_id] as any[]
        );

        // Retrieve the created transaction
        const [transactionRows] = await client.execute(
          `SELECT 
            t.*,
            a.name as account_name,
            c.name as category_name,
            c.color as category_color,
            c.icon as category_icon
           FROM transactions t
           LEFT JOIN accounts a ON t.account_id = a.id
           LEFT JOIN categories c ON t.category_id = c.id
           WHERE t.id = ?`,
          [id] as any[]
        );
        const rows = transactionRows as Transaction[];
        return rows[0];
      } catch (dbError: any) {
        console.error('❌ Database error in createTransaction:', dbError);
        if (dbError.code === '22P02') {
          throw new AppError('Invalid data format (e.g., invalid UUID)', 400);
        }
        if (dbError.code === '23503') {
          throw new AppError('Referenced account or category does not exist', 400);
        }
        throw new AppError('Failed to create transaction. Please check your data.', 500);
      }
    });
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    data: TransactionUpdateInput
  ): Promise<Transaction> {
    const existingTransaction = await this.getTransactionById(userId, transactionId);

    return await transaction(async (client) => {
      // Revert old balance effect (negative of original net change)
      const oldNetChange = existingTransaction.type === 'income' ? existingTransaction.amount : -existingTransaction.amount;
      await client.execute(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [oldNetChange, existingTransaction.account_id] as any[]
      );

      const updates: string[] = [];
      const values: any[] = [];

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
        throw new AppError('No fields to update', 400);
      }

      values.push(transactionId, userId);

      await client.execute(
        `UPDATE transactions SET ${updates.join(', ')} 
         WHERE id = ? AND user_id = ?`,
        values
      );

      // Apply new balance effect
      const updatedTransaction = await this.getTransactionById(userId, transactionId);
      const newNetChange = updatedTransaction.type === 'income' ? updatedTransaction.amount : -updatedTransaction.amount;
      await client.execute(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [newNetChange, updatedTransaction.account_id] as any[]
      );

      return updatedTransaction;
    });
  }

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const transaction = await this.getTransactionById(userId, transactionId);

    await transactionDb(async (client) => {
      // Revert balance
      const netChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      await client.execute(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [netChange, transaction.account_id] as any[]
      );

      await client.execute(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [transactionId, userId] as any[]
      );
    });
  }

  async getTransactionSummary(userId: string, startDate: string, endDate: string) {
    const result = await query<{
      total_income: string;
      total_expense: string;
      transaction_count: string;
    }>(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as transaction_count
       FROM transactions
       WHERE user_id = ? AND transaction_date BETWEEN ? AND ?`,
      [userId, startDate, endDate] as any[]
    );

    return {
      total_income: parseFloat(result.rows[0].total_income),
      total_expense: parseFloat(result.rows[0].total_expense),
      transaction_count: parseInt(result.rows[0].transaction_count),
      net_savings: parseFloat(result.rows[0].total_income) - parseFloat(result.rows[0].total_expense),
    };
  }
}

// Helper to avoid naming conflict
const transactionDb = transaction;

export const transactionService = new TransactionService();