"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = exports.CategoryService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const config_1 = __importDefault(require("../config"));
class CategoryService {
    async getAllCategories(userId, type) {
        let sql = `
      SELECT * FROM categories 
      WHERE (user_id = ? OR is_default = true)
    `;
        const params = [userId];
        if (type) {
            sql += ` AND type = ?`;
            params.push(type);
        }
        sql += ` ORDER BY is_default DESC, name ASC`;
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    async getCategoryById(userId, categoryId) {
        const result = await (0, database_1.query)(`SELECT * FROM categories 
       WHERE id = ? AND (user_id = ? OR is_default = true)`, [categoryId, userId]);
        if (result.rows.length === 0) {
            throw new error_middleware_1.AppError('Category not found', 404);
        }
        return result.rows[0];
    }
    async createCategory(userId, data) {
        const result = await (0, database_1.query)(`INSERT INTO categories (user_id, name, type, color, icon, is_default, created_at) 
       VALUES (?, ?, ?, ?, ?, false, NOW())`, [
            userId,
            data.name,
            data.type,
            data.color || '#3B82F6',
            data.icon || 'default',
        ]);
        const insertId = result.insertId;
        if (!insertId)
            throw new error_middleware_1.AppError('Failed to create category', 500);
        const newCategory = await (0, database_1.query)('SELECT * FROM categories WHERE id = ?', [insertId]);
        return newCategory.rows[0];
    }
    async updateCategory(userId, categoryId, data) {
        config_1.default.debug('Starting updateCategory: ' + JSON.stringify({ userId, categoryId, data }));
        // Check if category belongs to user (can't edit default categories)
        const existing = await (0, database_1.query)('SELECT * FROM categories WHERE id = ? AND user_id = ? AND is_default = false', [categoryId, userId]);
        config_1.default.debug('Existing category query result: ' + JSON.stringify({ rowCount: existing.rowCount }));
        if (!existing.rows || existing.rows.length === 0) {
            config_1.default.warn('Category not found or is default category: ' + JSON.stringify({ categoryId, userId }));
            throw new error_middleware_1.AppError('Category not found or cannot edit default categories', 404);
        }
        const updates = [];
        const values = [];
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
            throw new error_middleware_1.AppError('No fields to update', 400);
        }
        values.push(categoryId);
        // FIXED: Use string concatenation or JSON.stringify for logger
        config_1.default.debug('Executing update query: ' + `UPDATE categories SET ${updates.join(', ')} WHERE id = ${categoryId}`);
        await (0, database_1.query)(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
        const result = await (0, database_1.query)('SELECT * FROM categories WHERE id = ?', [categoryId]);
        config_1.default.debug('Category updated successfully: ' + result.rows[0].name);
        return result.rows[0];
    }
    async deleteCategory(userId, categoryId) {
        const result = await (0, database_1.query)('DELETE FROM categories WHERE id = ? AND user_id = ? AND is_default = false', [categoryId, userId]);
        if (result.rowCount === 0) {
            throw new error_middleware_1.AppError('Category not found or cannot delete default categories', 404);
        }
    }
}
exports.CategoryService = CategoryService;
exports.categoryService = new CategoryService();
//# sourceMappingURL=category.service.js.map