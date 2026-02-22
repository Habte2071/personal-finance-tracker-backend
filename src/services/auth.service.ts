import { query } from '../config/database';
import { User, UserCreateInput, LoginInput, AuthResponse, UserResponse } from '../types';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async register(data: UserCreateInput): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await query<User>(
      'SELECT id FROM users WHERE email = $1',
      [data.email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name, currency) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, currency, created_at`,
      [
        data.email.toLowerCase(),
        passwordHash,
        data.first_name,
        data.last_name,
        data.currency || 'USD',
      ]
    );

    const user = result.rows[0];

    // Create default accounts for new user
    await query(
      `INSERT INTO accounts (user_id, name, type, balance, description) 
       VALUES 
       ($1, 'Cash', 'cash', 0, 'Physical cash'),
       ($1, 'Main Checking', 'checking', 0, 'Primary checking account')`,
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const result = await query<User>(
      'SELECT id, email, password_hash, first_name, last_name, currency, created_at FROM users WHERE email = $1',
      [data.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    const isValidPassword = await comparePassword(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = await import('../utils/jwt.utils');
    
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const result = await query<User>(
        'SELECT id, email FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 401);
      }

      const user = result.rows[0];

      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
      const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
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

export const authService = new AuthService();