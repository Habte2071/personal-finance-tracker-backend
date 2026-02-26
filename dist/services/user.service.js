"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const password_utils_1 = require("../utils/password.utils");
class UserService {
    async getProfile(userId) {
        const result = await (0, database_1.query)('SELECT id, email, first_name, last_name, currency, created_at FROM users WHERE id = ?', [userId]);
        if (result.rows.length === 0) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        return this.formatUserResponse(result.rows[0]);
    }
    async updateProfile(userId, data) {
        const updates = [];
        const values = [];
        if (data.first_name !== undefined) {
            updates.push(`first_name = ?`);
            values.push(data.first_name);
        }
        if (data.last_name !== undefined) {
            updates.push(`last_name = ?`);
            values.push(data.last_name);
        }
        if (data.currency !== undefined) {
            updates.push(`currency = ?`);
            values.push(data.currency);
        }
        if (updates.length === 0) {
            throw new error_middleware_1.AppError('No fields to update', 400);
        }
        values.push(userId);
        await (0, database_1.query)(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        const result = await (0, database_1.query)('SELECT id, email, first_name, last_name, currency, created_at FROM users WHERE id = ?', [userId]);
        if (result.rows.length === 0) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        return this.formatUserResponse(result.rows[0]);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const userResult = await (0, database_1.query)('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (userResult.rows.length === 0) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        const isValid = await (0, password_utils_1.comparePassword)(currentPassword, userResult.rows[0].password_hash);
        if (!isValid) {
            throw new error_middleware_1.AppError('Current password is incorrect', 400);
        }
        const newHash = await (0, password_utils_1.hashPassword)(newPassword);
        await (0, database_1.query)('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    }
    formatUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            currency: user.currency,
            created_at: user.created_at,
        };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=user.service.js.map