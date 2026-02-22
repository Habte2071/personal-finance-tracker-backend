import { query } from '../config/database';
import { Budget, BudgetCreateInput } from '../types';
import { AppError } from '../middleware/error.middleware';

export class BudgetService {
  async getAllBudgets(userId: string): Promise<Budget[]> {
    const result = await query<Budget>(
      `SELECT 
        b.*,
        c.name as category_name,
        c.color as category_color,
        COALESCE(SUM(t.amount), 0) as spent,
        b.amount - COALESCE(SUM(t.amount), 0) as remaining,
        (COALESCE(SUM(t.amount), 0) / b.amount * 100) as percentage_used
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       LEFT JOIN transactions t ON b.category_id = t.category_id 
         AND t.type = 'expense'
         AND t.transaction_date >= b.start_date
         AND (b.end_date IS NULL OR t.transaction_date <= b.end_date)
       WHERE b.user_id = $1
       GROUP BY b.id, c.name, c.color
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getBudgetById(userId: string, budgetId: string): Promise<Budget> {
    const result = await query<Budget>(
      `SELECT 
        b.*,
        c.name as category_name,
        c.color as category_color,
        COALESCE(SUM(t.amount), 0) as spent,
        b.amount - COALESCE(SUM(t.amount), 0) as remaining,
        (COALESCE(SUM(t.amount), 0) / b.amount * 100) as percentage_used
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       LEFT JOIN transactions t ON b.category_id = t.category_id 
         AND t.type = 'expense'
         AND t.transaction_date >= b.start_date
         AND (b.end_date IS NULL OR t.transaction_date <= b.end_date)
       WHERE b.id = $1 AND b.user_id = $2
       GROUP BY b.id, c.name, c.color`,
      [budgetId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Budget not found', 404);
    }

    return result.rows[0];
  }

  async createBudget(userId: string, data: BudgetCreateInput): Promise<Budget> {
    // Validate category exists and is expense type
    const categoryResult = await query(
      'SELECT type FROM categories WHERE id = $1 AND (user_id = $2 OR is_default = true)',
      [data.category_id, userId]
    );

    if (categoryResult.rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    if ((categoryResult.rows[0] as { type: string }).type !== 'expense') {
      throw new AppError('Budget can only be created for expense categories', 400);
    }

    // Check if budget already exists for this category and period
    const existingResult = await query(
      `SELECT id FROM budgets 
       WHERE user_id = $1 AND category_id = $2 
       AND (end_date IS NULL OR end_date >= $3)`,
      [userId, data.category_id, data.start_date]
    );

    if (existingResult.rows.length > 0) {
      throw new AppError('Budget already exists for this category in the specified period', 409);
    }

    const result = await query<Budget>(
      `INSERT INTO budgets 
       (user_id, category_id, amount, period, start_date, end_date, alert_threshold) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        userId,
        data.category_id,
        data.amount,
        data.period,
        data.start_date,
        data.end_date || null,
        data.alert_threshold || 80,
      ]
    );

    return this.getBudgetById(userId, result.rows[0].id);
  }

  async updateBudget(
    userId: string,
    budgetId: string,
    data: Partial<BudgetCreateInput>
  ): Promise<Budget> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (data.amount !== undefined) {
      updates.push(`amount = $${paramCount}`);
      values.push(data.amount);
      paramCount++;
    }

    if (data.period !== undefined) {
      updates.push(`period = $${paramCount}`);
      values.push(data.period);
      paramCount++;
    }

    if (data.start_date !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      values.push(data.start_date);
      paramCount++;
    }

    if (data.end_date !== undefined) {
      updates.push(`end_date = $${paramCount}`);
      values.push(data.end_date);
      paramCount++;
    }

    if (data.alert_threshold !== undefined) {
      updates.push(`alert_threshold = $${paramCount}`);
      values.push(data.alert_threshold);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(budgetId);
    values.push(userId);

    const result = await query<Budget>(
      `UPDATE budgets SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('Budget not found', 404);
    }

    return this.getBudgetById(userId, budgetId);
  }

  async deleteBudget(userId: string, budgetId: string): Promise<void> {
    const result = await query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [budgetId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Budget not found', 404);
    }
  }

  async getBudgetAlerts(userId: string): Promise<Budget[]> {
    const budgets = await this.getAllBudgets(userId);
    return budgets.filter(budget => 
      parseFloat(budget.percentage_used as unknown as string) >= budget.alert_threshold
    );
  }
}

export const budgetService = new BudgetService();