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
    description: z.string().optional(),
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
    const id = req.params.id as string;
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
    try {
      console.log('🔍 update controller - full req.user:', req.user);
      console.log('🔍 update controller - typeof req.user:', typeof req.user);

      if (!req.user) {
        console.error('❌ req.user is undefined');
        throw new AppError('Unauthorized: No user attached', 401);
      }

      const user = req.user;

      console.log('🔍 update controller - user object keys:', Object.keys(user));
      console.log('🔍 update controller - user.id:', user.id);

      if (!user.id) {
        console.error('❌ user.id is missing. user object:', JSON.stringify(user));
        throw new AppError('User ID is missing from user object', 401);
      }

      const id = req.params.id as string;
      const data = req.body as Partial<AccountInput>;

      console.log('🔍 update controller - calling service with:', { userId: user.id, accountId: id, data });

      const account = await accountService.updateAccount(user.id, id, data);

      console.log('🔍 update controller - service returned:', account);

      successResponse(res, account, 'Account updated successfully');
    } catch (error) {
      console.error('❌ update controller caught error:', error);
      throw error; // let the global error handler deal with it
    }
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const id = req.params.id as string;
    await accountService.deleteAccount(req.user.id, id);
    successResponse(res, null, 'Account deleted successfully');
  });
}

export const accountController = new AccountController();
export { accountSchema, updateAccountSchema };