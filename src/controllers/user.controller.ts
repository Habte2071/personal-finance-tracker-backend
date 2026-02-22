import { Request, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service';
import { successResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

const updateProfileSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    currency: z.string().length(3).optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export class UserController {
  getProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await userService.getProfile(req.user!.id);
    successResponse(res, user, 'Profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await userService.updateProfile(req.user!.id, req.body);
    successResponse(res, user, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user!.id, currentPassword, newPassword);
    successResponse(res, null, 'Password changed successfully');
  });
}

export const userController = new UserController();
export { updateProfileSchema, changePasswordSchema };