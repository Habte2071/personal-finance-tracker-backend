import { Response } from 'express';
import { z } from 'zod';
import { accountService } from '../services/account.service';
import { successResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest, AccountInput } from '../types';
import { AppError } from '../middleware/error.middleware';
import logger from '../config';

const accountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Account name is required'),
    type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']),
    balance: z.number().optional(),
    currency: z.string().length(3).optional(),
    description: z.string().optional(),
  }),
});

const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']).optional(),
    balance: z.number().optional(),
    currency: z.string().length(3).optional(),
    description: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
  }),
});

export class AccountController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const accounts = await accountService.getAllAccounts(req.user.id);
    successResponse(res, accounts, 'Accounts retrieved successfully');
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) throw new AppError('Invalid account ID', 400);
    const account = await accountService.getAccountById(req.user.id, id);
    successResponse(res, account, 'Account retrieved successfully');
  });

  create = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const data = req.body as AccountInput;
    const account = await accountService.createAccount(req.user.id, data);
    successResponse(res, account, 'Account created successfully', 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    logger.debug('=== UPDATE ACCOUNT CONTROLLER START ===');
    logger.debug('req.user: ' + JSON.stringify(req.user));
    
    // CRITICAL: Check if req.user exists (same pattern as transaction)
    if (!req.user) {
      logger.error('update: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id; // This was failing - req.user was undefined
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) throw new AppError('Invalid account ID', 400);
    
    const data = req.body as Partial<AccountInput>;
    logger.debug('Updating account: ' + JSON.stringify({ userId, accountId: id, data }));
    
    const account = await accountService.updateAccount(userId, id, data);
    successResponse(res, account, 'Account updated successfully');
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) throw new AppError('Invalid account ID', 400);
    await accountService.deleteAccount(req.user.id, id);
    successResponse(res, null, 'Account deleted successfully');
  });
}

export const accountController = new AccountController();
export { accountSchema, updateAccountSchema };