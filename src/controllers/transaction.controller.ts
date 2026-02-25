import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { transactionService } from '../services/transaction.service';
import { successResponse, paginatedResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest, TransactionFilters, TransactionInput } from '../types';
import { AppError } from '../middleware/error.middleware';
import logger from '../config';

const transactionSchema = z.object({
  body: z.object({
    account_id: z.number().int().positive('Invalid account ID'),
    category_id: z.number().int().positive().optional(),
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(1, 'Description is required'),
    transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    notes: z.string().optional(),
  }),
});

const updateTransactionSchema = z.object({
  body: z.object({
    account_id: z.number().int().positive().optional(),
    category_id: z.number().int().positive().nullable().optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    amount: z.number().positive().optional(),
    description: z.string().min(1).optional(),
    transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: z.string().nullable().optional(),
  }),
});

const querySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    accountId: z.coerce.number().int().positive().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    minAmount: z.coerce.number().optional(),
    maxAmount: z.coerce.number().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().max(100).default(20),
  }),
});

export class TransactionController {
  // FIXED: Use AuthRequest explicitly in asyncHandler
  getAll = asyncHandler<AuthRequest>(async (req, res): Promise<void> => {
    // DEBUG: Check if user exists
    if (!req.user) {
      logger.error('getAll: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id;
    logger.debug('getAll: userId =', userId);

    const filters: TransactionFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      accountId: req.query.accountId ? Number(req.query.accountId) : undefined,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      type: req.query.type as 'income' | 'expense' | 'transfer',
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const { transactions, total } = await transactionService.getTransactions(userId, filters);
    paginatedResponse(res, transactions, total, filters.page || 1, filters.limit || 20, 'Transactions retrieved successfully');
  });

  getById = asyncHandler<AuthRequest>(async (req, res): Promise<void> => {
    if (!req.user) {
      logger.error('getById: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id;
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) throw new AppError('Invalid transaction ID', 400);
    
    const transaction = await transactionService.getTransactionById(userId, id);
    successResponse(res, transaction, 'Transaction retrieved successfully');
  });

  create = asyncHandler<AuthRequest>(async (req, res): Promise<void> => {
    if (!req.user) {
      logger.error('create: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id;
    const data = req.body as TransactionInput;
    const transaction = await transactionService.createTransaction(userId, data);
    successResponse(res, transaction, 'Transaction created successfully', 201);
  });

  update = asyncHandler<AuthRequest>(async (req, res): Promise<void> => {
    logger.debug('=== UPDATE CONTROLLER START ===');
    logger.debug('req.user:', req.user);
    logger.debug('req.body:', req.body);
    logger.debug('req.params:', req.params);
    
    if (!req.user) {
      logger.error('update: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id;
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) throw new AppError('Invalid transaction ID', 400);
    
    const data = req.body as Partial<TransactionInput>;
    logger.debug('Updating transaction:', { userId, transactionId: id, data });
    
    const transaction = await transactionService.updateTransaction(userId, id, data);
    successResponse(res, transaction, 'Transaction updated successfully');
  });

  delete = asyncHandler<AuthRequest>(async (req, res): Promise<void> => {
    if (!req.user) {
      logger.error('delete: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id;
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) throw new AppError('Invalid transaction ID', 400);
    
    await transactionService.deleteTransaction(userId, id);
    successResponse(res, null, 'Transaction deleted successfully');
  });

  getSummary = asyncHandler<AuthRequest>(async (req, res): Promise<void> => {
    if (!req.user) {
      logger.error('getSummary: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const summary = await transactionService.getTransactionSummary(
      userId,
      startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate as string || new Date().toISOString().split('T')[0]
    );
    successResponse(res, summary, 'Transaction summary retrieved successfully');
  });
}

export const transactionController = new TransactionController();
export { transactionSchema, updateTransactionSchema, querySchema };