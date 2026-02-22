import { query } from '../config/database';
import { Category, CategoryCreateInput } from '../types';
import { AppError } from '../middleware/error.middleware';
import crypto from 'crypto';

export class CategoryService {
  async getAllCategories(userId: string, type?: 'income' | 'expense'): Promise<Category[]> {
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

  async getCategoryById(userId: string, categoryId: string): Promise<Category> {
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

  async createCategory(userId: string, data: CategoryCreateInput): Promise<Category> {
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO categories (id, user_id, name, type, color, icon, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, false)`,
      [
        id,
        userId,
        data.name,
        data.type,
        data.color || '#3B82F6',
        data.icon || 'default',
      ]
    );

    const result = await query<Category>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
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
      'SELECT * FROM categories WHERE id = ? AND user_id = ? AND is_default = false',
      [categoryId, userId]
    );

    if (existing.rows.length === 0) {
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

    await query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const result = await query<Category>(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    return result.rows[0];
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const result = await query(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_default = false',
      [categoryId, userId]
    );

    if (result.rowsAffected === 0) {
      throw new AppError('Category not found or cannot delete default categories', 404);
    }
  }
}

export const categoryService = new CategoryService();