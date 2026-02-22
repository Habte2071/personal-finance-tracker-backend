import { query } from '../config/database';
import { User, UserResponse } from '../types';
import { AppError } from '../middleware/error.middleware';
import { hashPassword } from '../utils/password.utils';

export class UserService {
  async getProfile(userId: string): Promise<UserResponse> {
    const result = await query<User>(
      'SELECT id, email, first_name, last_name, currency, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return this.formatUserResponse(result.rows[0]);
  }

  async updateProfile(
    userId: string,
    data: { first_name?: string; last_name?: string; currency?: string }
  ): Promise<UserResponse> {
    const updates: string[] = [];
    const values: unknown[] = [];

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
      throw new AppError('No fields to update', 400);
    }

    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const result = await query<User>(
      'SELECT id, email, first_name, last_name, currency, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return this.formatUserResponse(result.rows[0]);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const { comparePassword, hashPassword } = await import('../utils/password.utils');
    
    // Get current password hash
    const userResult = await query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash and update new password
    const newHash = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
  }

  private formatUserResponse(user: User): UserResponse {
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

export const userService = new UserService();