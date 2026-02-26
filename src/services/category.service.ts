import { query } from '../config/database';
import { Category, CategoryCreateInput } from '../types';
import { AppError } from '../middleware/error.middleware';
import logger from '../config';

export class CategoryService {
  async getAllCategories(userId: number, type?: 'income' | 'expense'): Promise<Category[]> {
    let sql = `
      SELECT * FROM categories 
      WHERE (user_id = ? OR is_default = true)
    `;
    const params: unknown[] = [userId];

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY is_default DESC, name ASC`;

    const result = await query<Category>(sql, params);
    return result.rows;
  }

  async getCategoryById(userId: number, categoryId: number): Promise<Category> {
    const result = await query<Category>(
      `SELECT * FROM categories 
       WHERE id = ? AND (user_id = ? OR is_default = true)`,
      [categoryId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    return result.rows[0];
  }

  async createCategory(userId: number, data: CategoryCreateInput): Promise<Category> {
    const result = await query(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default, created_at) 
       VALUES (?, ?, ?, ?, ?, false, NOW())`,
      [
        userId,
        data.name,
        data.type,
        data.color || '#3B82F6',
        data.icon || 'default',
      ]
    );

    const insertId = result.insertId;
    if (!insertId) throw new AppError('Failed to create category', 500);

    const newCategory = await query<Category>(
      'SELECT * FROM categories WHERE id = ?',
      [insertId]
    );
    return newCategory.rows[0];
  }

  async updateCategory(
    userId: number,
    categoryId: number,
    data: Partial<CategoryCreateInput>
  ): Promise<Category> {
    logger.debug('Starting updateCategory: ' + JSON.stringify({ userId, categoryId, data }));

    // Check if category belongs to user (can't edit default categories)
    const existing = await query<Category>(
      'SELECT * FROM categories WHERE id = ? AND user_id = ? AND is_default = false',
      [categoryId, userId]
    );

    logger.debug('Existing category query result: ' + JSON.stringify({ rowCount: existing.rowCount }));

    if (!existing.rows || existing.rows.length === 0) {
      logger.warn('Category not found or is default category: ' + JSON.stringify({ categoryId, userId }));
      throw new AppError('Category not found or cannot edit default categories', 404);
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      updates.push(`name = ?`);
      values.push(data.name);
    }

    if (data.type !== undefined) {
      updates.push(`type = ?`);
      values.push(data.type);
    }

    if (data.color !== undefined) {
      updates.push(`color = ?`);
      values.push(data.color);
    }

    if (data.icon !== undefined) {
      updates.push(`icon = ?`);
      values.push(data.icon);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(categoryId);

    // FIXED: Use string concatenation or JSON.stringify for logger
    logger.debug('Executing update query: ' + `UPDATE categories SET ${updates.join(', ')} WHERE id = ${categoryId}`);

    await query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const result = await query<Category>(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    
    logger.debug('Category updated successfully: ' + result.rows[0].name);
    return result.rows[0];
  }

  async deleteCategory(userId: number, categoryId: number): Promise<void> {
    const result = await query(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_default = false',
      [categoryId, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Category not found or cannot delete default categories', 404);
    }
  }
}

export const categoryService = new CategoryService();