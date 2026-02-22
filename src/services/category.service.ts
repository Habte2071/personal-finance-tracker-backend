import { query } from '../config/database';
import { Category, CategoryCreateInput } from '../types';
import { AppError } from '../middleware/error.middleware';

export class CategoryService {
  async getAllCategories(userId: string, type?: 'income' | 'expense'): Promise<Category[]> {
    let sql = `
      SELECT * FROM categories 
      WHERE (user_id = $1 OR is_default = true)
    `;
    const params: unknown[] = [userId];

    if (type) {
      sql += ` AND type = $2`;
      params.push(type);
    }

    sql += ` ORDER BY is_default DESC, name ASC`;

    const result = await query<Category>(sql, params);
    return result.rows;
  }

  async getCategoryById(userId: string, categoryId: string): Promise<Category> {
    const result = await query<Category>(
      `SELECT * FROM categories 
       WHERE id = $1 AND (user_id = $2 OR is_default = true)`,
      [categoryId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    return result.rows[0];
  }

  async createCategory(userId: string, data: CategoryCreateInput): Promise<Category> {
    const result = await query<Category>(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default) 
       VALUES ($1, $2, $3, $4, $5, false) 
       RETURNING *`,
      [
        userId,
        data.name,
        data.type,
        data.color || '#3B82F6',
        data.icon || 'default',
      ]
    );

    return result.rows[0];
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    data: Partial<CategoryCreateInput>
  ): Promise<Category> {
    // Check if category belongs to user (can't edit default categories)
    const existing = await query<Category>(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2 AND is_default = false',
      [categoryId, userId]
    );

    if (existing.rows.length === 0) {
      throw new AppError('Category not found or cannot edit default categories', 404);
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.type !== undefined) {
      updates.push(`type = $${paramCount}`);
      values.push(data.type);
      paramCount++;
    }

    if (data.color !== undefined) {
      updates.push(`color = $${paramCount}`);
      values.push(data.color);
      paramCount++;
    }

    if (data.icon !== undefined) {
      updates.push(`icon = $${paramCount}`);
      values.push(data.icon);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(categoryId);

    const result = await query<Category>(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const result = await query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 AND is_default = false RETURNING id',
      [categoryId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Category not found or cannot delete default categories', 404);
    }
  }
}

export const categoryService = new CategoryService();