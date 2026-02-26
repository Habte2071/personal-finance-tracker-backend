import { query } from '../config/database';
import { User, UserCreateInput, LoginInput, AuthResponse, UserResponse } from '../types';
import { AppError } from '../middleware/error.middleware';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';

export class AuthService {
  async register(data: UserCreateInput): Promise<AuthResponse> {
    const { email, password, first_name, last_name, currency = 'USD' } = data;

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await hashPassword(password);

    // Insert user – id is auto-generated
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, currency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [email, hashedPassword, first_name, last_name, currency]
    );

    const insertId = result.insertId;
    if (!insertId) {
      throw new AppError('User creation failed', 500);
    }

    const user = await this.findUserById(insertId);
    if (!user) throw new AppError('User creation failed', 500);

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    const result = await query<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
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
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await this.findUserById(decoded.userId);
      if (!user) throw new AppError('User not found', 401);

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

  private async findUserById(id: number): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE id = ?', [id]);
    return result.rows[0] || null;
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