import { Response } from 'express';
import { z } from 'zod';
import { dashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    months: z.coerce.number().default(6),
  }),
});

export class DashboardController {
  getStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await dashboardService.getDashboardStats(req.user!.id);
    successResponse(res, stats, 'Dashboard stats retrieved successfully');
  });

  getMonthlyTrend = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const months = req.query.months ? Number(req.query.months) : 6;
    const trend = await dashboardService.getMonthlyTrend(req.user!.id, months);
    successResponse(res, trend, 'Monthly trend retrieved successfully');
  });

  getExpenseByCategory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;
    const summary = await dashboardService.getExpenseByCategory(
      req.user!.id,
      startDate as string,
      endDate as string
    );
    successResponse(res, summary, 'Expense by category retrieved successfully');
  });

  getRecentTransactions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const transactions = await dashboardService.getRecentTransactions(req.user!.id, limit);
    successResponse(res, transactions, 'Recent transactions retrieved successfully');
  });
}

export const dashboardController = new DashboardController();
export { dateRangeSchema };