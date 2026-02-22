import { Response } from 'express';
import { z } from 'zod';
import { transactionService } from '../services/transaction.service';
import { successResponse, paginatedResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest, TransactionFilters, TransactionInput } from '../types';

const transactionSchema = z.object({
  body: z.object({
    account_id: z.string().uuid('Invalid account ID'),
    category_id: z.string().uuid('Invalid category ID').optional(),
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(1, 'Description is required'),
    transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    notes: z.string().optional(),
  }),
});

const updateTransactionSchema = z.object({
  body: z.object({
    account_id: z.string().uuid().optional(),
    category_id: z.string().uuid().optional().nullable(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    amount: z.number().positive().optional(),
    description: z.string().min(1).optional(),
    transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: z.string().optional().nullable(),
  }),
});

const querySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    minAmount: z.coerce.number().optional(),
    maxAmount: z.coerce.number().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().max(100).default(20),
  }),
});

export class TransactionController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const filters: TransactionFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      accountId: req.query.accountId as string,
      categoryId: req.query.categoryId as string,
      type: req.query.type as 'income' | 'expense' | 'transfer',
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const { transactions, total } = await transactionService.getTransactions(req.user!.id, filters);
    
    paginatedResponse(
      res,
      transactions,
      total,
      filters.page || 1,
      filters.limit || 20,
      'Transactions retrieved successfully'
    );
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const transaction = await transactionService.getTransactionById(req.user!.id, id);
    successResponse(res, transaction, 'Transaction retrieved successfully');
  });

  create = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const data = req.body as TransactionInput;
    const transaction = await transactionService.createTransaction(req.user!.id, data);
    successResponse(res, transaction, 'Transaction created successfully', 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const data = req.body as Partial<TransactionInput>;
    const transaction = await transactionService.updateTransaction(req.user!.id, id, data);
    successResponse(res, transaction, 'Transaction updated successfully');
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await transactionService.deleteTransaction(req.user!.id, id);
    successResponse(res, null, 'Transaction deleted successfully');
  });

  getSummary = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;
    const summary = await transactionService.getTransactionSummary(
      req.user!.id,
      startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate as string || new Date().toISOString().split('T')[0]
    );
    successResponse(res, summary, 'Transaction summary retrieved successfully');
  });
}

export const transactionController = new TransactionController();
export { transactionSchema, updateTransactionSchema, querySchema };