import { Response } from 'express';
import { z } from 'zod';
import { budgetService } from '../services/budget.service';
import { successResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest, BudgetInput } from '../types';

const budgetSchema = z.object({
  body: z.object({
    category_id: z.string().uuid('Invalid category ID'),
    amount: z.number().positive('Amount must be positive'),
    period: z.enum(['weekly', 'monthly', 'yearly']),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    alert_threshold: z.number().min(0).max(100).optional(),
  }),
});

const updateBudgetSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    alert_threshold: z.number().min(0).max(100).optional(),
  }),
});

export class BudgetController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const budgets = await budgetService.getAllBudgets(req.user!.id);
    successResponse(res, budgets, 'Budgets retrieved successfully');
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const budget = await budgetService.getBudgetById(req.user!.id, id);
    successResponse(res, budget, 'Budget retrieved successfully');
  });

  create = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const data = req.body as BudgetInput;
    const budget = await budgetService.createBudget(req.user!.id, data);
    successResponse(res, budget, 'Budget created successfully', 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const data = req.body as Partial<BudgetInput>;
    const budget = await budgetService.updateBudget(req.user!.id, id, data);
    successResponse(res, budget, 'Budget updated successfully');
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await budgetService.deleteBudget(req.user!.id, id);
    successResponse(res, null, 'Budget deleted successfully');
  });

  getAlerts = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const alerts = await budgetService.getBudgetAlerts(req.user!.id);
    successResponse(res, alerts, 'Budget alerts retrieved successfully');
  });
}

export const budgetController = new BudgetController();
export { budgetSchema, updateBudgetSchema };