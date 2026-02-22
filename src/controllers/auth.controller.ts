import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    currency: z.string().length(3).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    successResponse(res, result, 'User registered successfully', 201);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    successResponse(res, result, 'Login successful');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    successResponse(res, result, 'Token refreshed successfully');
  });

  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    successResponse(res, {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      currency: user.currency,
      created_at: user.created_at,
    }, 'User profile retrieved');
  });
}

export const authController = new AuthController();
export { registerSchema, loginSchema, refreshSchema };