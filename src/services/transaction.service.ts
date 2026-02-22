import { query, transaction } from '../config/database';
import { Transaction, TransactionCreateInput, TransactionUpdateInput, TransactionFilters } from '../types';
import { AppError } from '../middleware/error.middleware';

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

    let whereClause = 'WHERE t.user_id = $1';
    const params: unknown[] = [userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      whereClause += ` AND t.transaction_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereClause += ` AND t.transaction_date <= $${paramCount}`;
      params.push(endDate);
    }

    if (accountId) {
      paramCount++;
      whereClause += ` AND t.account_id = $${paramCount}`;
      params.push(accountId);
    }

    if (categoryId) {
      paramCount++;
      whereClause += ` AND t.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND t.type = $${paramCount}`;
      params.push(type);
    }

    if (minAmount !== undefined) {
      paramCount++;
      whereClause += ` AND t.amount >= $${paramCount}`;
      params.push(minAmount);
    }

    if (maxAmount !== undefined) {
      paramCount++;
      whereClause += ` AND t.amount <= $${paramCount}`;
      params.push(maxAmount);
    }

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM transactions t ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get transactions with pagination
    const offset = (page - 1) * limit;
    params.push(limit);
    params.push(offset);

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
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      params
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
       WHERE t.id = $1 AND t.user_id = $2`,
      [transactionId, userId]
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
      'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
      [data.account_id, userId]
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
        'SELECT id FROM categories WHERE id = $1 AND (user_id = $2 OR is_default = true)',
        [data.category_id, userId]
      );
      if (categoryResult.rows.length === 0) {
        throw new AppError('Category not found', 404);
      }
      categoryId = data.category_id;
    }

    return await transaction(async (client) => {
      try {
        // Insert transaction
        const transactionResult = await client.query<Transaction>(
          `INSERT INTO transactions 
           (user_id, account_id, category_id, type, amount, description, transaction_date, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [
            userId,
            data.account_id,
            categoryId,
            data.type,
            data.amount,
            data.description,
            data.transaction_date,
            data.notes || null,
          ]
        );

        // Compute net change and update account balance
        const netChange = data.type === 'income' ? data.amount : -data.amount;
        await client.query(
          'UPDATE accounts SET balance = balance + CAST($1 AS numeric) WHERE id = $2',
          [netChange, data.account_id]
        );

        return transactionResult.rows[0];
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
      await client.query(
        'UPDATE accounts SET balance = balance - CAST($1 AS numeric) WHERE id = $2',
        [oldNetChange, existingTransaction.account_id]
      );

      const updates: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (data.account_id !== undefined) {
        updates.push(`account_id = $${paramCount}`);
        values.push(data.account_id);
        paramCount++;
      }
      if (data.category_id !== undefined) {
        updates.push(`category_id = $${paramCount}`);
        values.push(data.category_id);
        paramCount++;
      }
      if (data.type !== undefined) {
        updates.push(`type = $${paramCount}`);
        values.push(data.type);
        paramCount++;
      }
      if (data.amount !== undefined) {
        updates.push(`amount = $${paramCount}`);
        values.push(data.amount);
        paramCount++;
      }
      if (data.description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(data.description);
        paramCount++;
      }
      if (data.transaction_date !== undefined) {
        updates.push(`transaction_date = $${paramCount}`);
        values.push(data.transaction_date);
        paramCount++;
      }
      if (data.notes !== undefined) {
        updates.push(`notes = $${paramCount}`);
        values.push(data.notes);
        paramCount++;
      }

      if (updates.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      values.push(transactionId);
      values.push(userId);

      const result = await client.query<Transaction>(
        `UPDATE transactions SET ${updates.join(', ')} 
         WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
         RETURNING *`,
        values
      );

      const updatedTransaction = result.rows[0];

      // Apply new balance effect
      const newNetChange = updatedTransaction.type === 'income' ? updatedTransaction.amount : -updatedTransaction.amount;
      await client.query(
        'UPDATE accounts SET balance = balance + CAST($1 AS numeric) WHERE id = $2',
        [newNetChange, updatedTransaction.account_id]
      );

      return updatedTransaction;
    });
  }

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const transaction = await this.getTransactionById(userId, transactionId);

    await transaction_db(async (client) => {
      // Revert balance
      const netChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      await client.query(
        'UPDATE accounts SET balance = balance - CAST($1 AS numeric) WHERE id = $2',
        [netChange, transaction.account_id]
      );

      await client.query(
        'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
        [transactionId, userId]
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
       WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3`,
      [userId, startDate, endDate]
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
const transaction_db = transaction;

export const transactionService = new TransactionService();