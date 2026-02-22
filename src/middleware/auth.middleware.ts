import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt.utils';
import { query } from '../config/database';
import logger from '../config';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No Bearer token');
      res.status(401).json({ success: false, message: 'Access token is required' });
      return;
    }

    const token = authHeader.substring(7);
    let decoded: { userId: string };

    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'TokenExpiredError') {
          logger.warn('Authentication failed: Token expired');
          res.status(401).json({ success: false, message: 'Token expired' });
          return;
        }
        if (err.name === 'JsonWebTokenError') {
          logger.warn('Authentication failed: Invalid token');
          res.status(401).json({ success: false, message: 'Invalid token' });
          return;
        }
      }
      logger.warn('Authentication failed: Token verification error', err);
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    // Fetch user – MySQL uses ? placeholders
    const result = await query<any>(
      `SELECT 
         id,
         email, 
         password_hash, 
         first_name, 
         last_name, 
         currency, 
         created_at, 
         updated_at 
       FROM users 
       WHERE id = ?`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      logger.warn(`Authentication failed: User not found for id ${decoded.userId}`);
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const userRow = result.rows[0];
    // Force an 'id' property – take the first non-null value
    userRow.id = userRow.id || userRow.user_id;
    if (!userRow.id) {
      logger.error('User row has no id:', userRow);
      res.status(500).json({ success: false, message: 'User record corrupted' });
      return;
    }

    req.user = userRow;
    // Use userRow directly to avoid TS error about req.user being possibly undefined
    logger.debug('✅ Authentication successful, user attached:', { id: userRow.id, email: userRow.email });
    next();
  } catch (error) {
    logger.error('❌ Unexpected authentication error:', error);
    next(error);
  }
};