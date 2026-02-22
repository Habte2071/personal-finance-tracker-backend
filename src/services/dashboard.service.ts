import { query } from '../config/database';
import { DashboardStats, MonthlyData, CategorySummary, RecentTransaction } from '../types';

export class DashboardService {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get total balance
    const balanceResult = await query<{ total_balance: string }>(
      'SELECT COALESCE(SUM(balance), 0) as total_balance FROM accounts WHERE user_id = ? AND is_active = true',
      [userId]
    );

    // Get current month income/expense
    const currentMonthResult = await query<{
      income: string;
      expense: string;
    }>(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = ? AND transaction_date >= ?`,
      [userId, currentMonthStart.toISOString().split('T')[0]]
    );

    // Get last month income/expense
    const lastMonthResult = await query<{
      income: string;
      expense: string;
    }>(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = ? AND transaction_date BETWEEN ? AND ?`,
      [userId, lastMonthStart.toISOString().split('T')[0], lastMonthEnd.toISOString().split('T')[0]]
    );

    const currentIncome = parseFloat(currentMonthResult.rows[0].income);
    const currentExpense = parseFloat(currentMonthResult.rows[0].expense);
    const lastIncome = parseFloat(lastMonthResult.rows[0].income);
    const lastExpense = parseFloat(lastMonthResult.rows[0].expense);

    const currentNet = currentIncome - currentExpense;
    const lastNet = lastIncome - lastExpense;
    
    let monthlyChange = 0;
    if (lastNet !== 0) {
      monthlyChange = ((currentNet - lastNet) / Math.abs(lastNet)) * 100;
    } else if (currentNet > 0) {
      monthlyChange = 100;
    }

    return {
      total_balance: parseFloat(balanceResult.rows[0].total_balance),
      total_income: currentIncome,
      total_expense: currentExpense,
      net_savings: currentNet,
      monthly_change: Math.round(monthlyChange * 100) / 100,
    };
  }

  async getMonthlyTrend(userId: string, months: number = 6): Promise<MonthlyData[]> {
    // Calculate start date: first day of the month, (months-1) months ago
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - (months - 1));
    const startDateStr = startDate.toISOString().split('T')[0];

    const result = await query<{
      month: string;
      income: string;
      expense: string;
    }>(
      `SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = ? 
         AND transaction_date >= ?
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY month ASC`,
      [userId, startDateStr]
    );

    return result.rows.map(row => ({
      month: row.month,
      income: parseFloat(row.income),
      expense: parseFloat(row.expense),
    }));
  }

  async getExpenseByCategory(userId: string, startDate?: string, endDate?: string): Promise<CategorySummary[]> {
    const currentDate = new Date();
    const defaultStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const defaultEndDate = currentDate;

    const result = await query<{
      category_id: string;
      category_name: string;
      category_color: string;
      total: string;
    }>(
      `SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? 
         AND t.type = 'expense'
         AND t.transaction_date BETWEEN ? AND ?
       GROUP BY c.id, c.name, c.color
       ORDER BY total DESC`,
      [
        userId,
        startDate || defaultStartDate.toISOString().split('T')[0],
        endDate || defaultEndDate.toISOString().split('T')[0],
      ]
    );

    const totalExpense = result.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);

    return result.rows.map(row => ({
      category_id: row.category_id,
      category_name: row.category_name,
      category_color: row.category_color,
      total: parseFloat(row.total),
      percentage: totalExpense > 0 ? Math.round((parseFloat(row.total) / totalExpense) * 100 * 100) / 100 : 0,
    }));
  }

  async getRecentTransactions(userId: string, limit: number = 5): Promise<RecentTransaction[]> {
    const result = await query<RecentTransaction>(
      `SELECT 
        t.*,
        a.name as account_name,
        c.name as category_name,
        c.color as category_color
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    return result.rows;
  }
}

export const dashboardService = new DashboardService();