import { Response } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/category.service';
import { successResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest, CategoryInput } from '../types';
import { AppError } from '../middleware/error.middleware';
import logger from '../config';

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
    type: z.enum(['income', 'expense']),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.enum(['income', 'expense']).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
  }),
});

export class CategoryController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { type } = req.query;
    const categories = await categoryService.getAllCategories(
      req.user.id,
      type as 'income' | 'expense' | undefined
    );
    successResponse(res, categories, 'Categories retrieved successfully');
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) throw new AppError('Invalid category ID', 400);
    const category = await categoryService.getCategoryById(req.user.id, id);
    successResponse(res, category, 'Category retrieved successfully');
  });

  create = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const data = req.body as CategoryInput;
    const category = await categoryService.createCategory(req.user.id, data);
    successResponse(res, category, 'Category created successfully', 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    logger.debug('Update category request received');
    
    // CRITICAL: Check if req.user exists (same pattern as transaction)
    if (!req.user) {
      logger.error('update: req.user is undefined');
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id; // This is line that was failing - req.user was undefined
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) throw new AppError('Invalid category ID', 400);
    
    const data = req.body as Partial<CategoryInput>;
    logger.debug('Updating category:', { userId, categoryId: id, data });
    
    const category = await categoryService.updateCategory(userId, id, data);
    successResponse(res, category, 'Category updated successfully');
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) throw new AppError('Invalid category ID', 400);
    await categoryService.deleteCategory(req.user.id, id);
    successResponse(res, null, 'Category deleted successfully');
  });
}

export const categoryController = new CategoryController();
export { categorySchema, updateCategorySchema };