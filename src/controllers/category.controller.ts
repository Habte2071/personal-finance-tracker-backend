import { Response } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/category.service';
import { successResponse } from '../utils/apiResponse.utils';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest, CategoryInput } from '../types';

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
    const { type } = req.query;
    const categories = await categoryService.getAllCategories(
      req.user!.id,
      type as 'income' | 'expense' | undefined
    );
    successResponse(res, categories, 'Categories retrieved successfully');
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const category = await categoryService.getCategoryById(req.user!.id, id);
    successResponse(res, category, 'Category retrieved successfully');
  });

  create = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const data = req.body as CategoryInput;
    const category = await categoryService.createCategory(req.user!.id, data);
    successResponse(res, category, 'Category created successfully', 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const data = req.body as Partial<CategoryInput>;
    const category = await categoryService.updateCategory(req.user!.id, id, data);
    successResponse(res, category, 'Category updated successfully');
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await categoryService.deleteCategory(req.user!.id, id);
    successResponse(res, null, 'Category deleted successfully');
  });
}

export const categoryController = new CategoryController();
export { categorySchema, updateCategorySchema };