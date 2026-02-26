import { query, transaction } from '../config/database';
import { Transaction, TransactionCreateInput, TransactionUpdateInput, TransactionFilters } from '../types';
import { AppError } from '../middleware/error.middleware';
import { PoolConnection } from 'mysql2/promise';
import logger from '../config';

export class TransactionService {
  async getTransactions(userId: number, filters: TransactionFilters): Promise<{ transactions: Transaction[]; total: number }> {
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

    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions t ${whereClause}`,
      params
    );
    const total = Number(countResult.rows[0].count);

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
      paginatedParams
    );

    return {
      transactions: result.rows,
      total,
    };
  }

  async getTransactionById(userId: number, transactionId: number): Promise<Transaction> {
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
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Transaction not found', 404);
    }

    return result.rows[0];
  }

  async createTransaction(userId: number, data: TransactionCreateInput): Promise<Transaction> {
    const accountResult = await query(
      'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
      [data.account_id, userId]
    );
    if (accountResult.rows.length === 0) {
      throw new AppError('Account not found', 404);
    }

    if (typeof data.amount !== 'number' || isNaN(data.amount) || !isFinite(data.amount)) {
      throw new AppError('Amount must be a valid number', 400);
    }

    let categoryId: number | null = null;
    if (data.category_id) {
      const categoryResult = await query(
        'SELECT id FROM categories WHERE id = ? AND (user_id = ? OR is_default = true)',
        [data.category_id, userId]
      );
      if (categoryResult.rows.length === 0) {
        throw new AppError('Category not found', 404);
      }
      categoryId = data.category_id;
    }

    return await transaction(async (client) => {
      const [insertResult] = await client.execute(
        `INSERT INTO transactions 
         (user_id, account_id, category_id, type, amount, description, transaction_date, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, data.account_id, categoryId, data.type, data.amount, data.description, data.transaction_date, data.notes || null]
      );

      const insertId = (insertResult as any).insertId;
      if (!insertId) throw new AppError('Failed to create transaction', 500);

      const netChange = data.type === 'income' ? data.amount : -data.amount;
      await client.execute(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [netChange, data.account_id]
      );

      // Fetch the created transaction using the client connection
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
        [insertId]
      );
      const rows = transactionRows as Transaction[];
      return rows[0];
    });
  }

  async updateTransaction(
    userId: number,
    transactionId: number,
    data: TransactionUpdateInput
  ): Promise<Transaction> {
    logger.debug('Starting updateTransaction:', { userId, transactionId, data });

    if (!transactionId || transactionId <= 0) {
      throw new AppError('Invalid transaction ID', 400);
    }

    // Get existing transaction BEFORE starting the transaction
    const existingTransaction = await this.getTransactionById(userId, transactionId);
    logger.debug('Found existing transaction:', existingTransaction);

    return await transaction(async (client) => {
      try {
        // Revert old balance
        const oldNetChange = existingTransaction.type === 'income' ? existingTransaction.amount : -existingTransaction.amount;
        await client.execute(
          'UPDATE accounts SET balance = balance - ? WHERE id = ?',
          [oldNetChange, existingTransaction.account_id]
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
          `UPDATE transactions SET ${updates.join(', ')}, updated_at = NOW() 
           WHERE id = ? AND user_id = ?`,
          values
        );

        // Fetch updated transaction using client connection
        const [updatedRows] = await client.execute(
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
          [transactionId, userId]
        );
        
        const rows = updatedRows as Transaction[];
        if (rows.length === 0) {
          throw new AppError('Transaction not found after update', 404);
        }
        
        const updatedTransaction = rows[0];

        // Apply new balance
        const newNetChange = updatedTransaction.type === 'income' ? updatedTransaction.amount : -updatedTransaction.amount;
        await client.execute(
          'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          [newNetChange, updatedTransaction.account_id]
        );

        return updatedTransaction;
      } catch (dbError: any) {
        logger.error('Database error in updateTransaction:', dbError);
        throw new AppError('Failed to update transaction: ' + dbError.message, 500);
      }
    });
  }

  async deleteTransaction(userId: number, transactionId: number): Promise<void> {
    const tx = await this.getTransactionById(userId, transactionId);

    await transaction(async (client: PoolConnection) => {
      const netChange = tx.type === 'income' ? tx.amount : -tx.amount;
      await client.execute(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [netChange, tx.account_id]
      );

      await client.execute(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [transactionId, userId]
      );
    });
  }

  async getTransactionSummary(userId: number, startDate: string, endDate: string) {
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
      [userId, startDate, endDate]
    );

    return {
      total_income: parseFloat(result.rows[0].total_income),
      total_expense: parseFloat(result.rows[0].total_expense),
      transaction_count: parseInt(result.rows[0].transaction_count, 10),
      net_savings: parseFloat(result.rows[0].total_income) - parseFloat(result.rows[0].total_expense),
    };
  }
}

export const transactionService = new TransactionService();