import { Request, Response, NextFunction } from 'express';
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
    let decoded: { userId: number; email: string };

    try {
      decoded = verifyAccessToken(token);
      logger.debug('Token decoded successfully:', { userId: decoded.userId, email: decoded.email });
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

    // Fetch user from database
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
    
    // Ensure all required fields are present and properly typed
    req.user = {
      id: Number(userRow.id),
      email: String(userRow.email),
      password_hash: String(userRow.password_hash),
      first_name: userRow.first_name ? String(userRow.first_name) : '',
      last_name: userRow.last_name ? String(userRow.last_name) : '',
      currency: userRow.currency ? String(userRow.currency) : 'USD',
      created_at: userRow.created_at ? new Date(userRow.created_at) : new Date(),
      updated_at: userRow.updated_at ? new Date(userRow.updated_at) : new Date(),
    };

    logger.debug('✅ Authentication successful, user attached:', { 
      id: req.user.id, 
      email: req.user.email,
      type: typeof req.user.id
    });
    
    next();
  } catch (error) {
    logger.error('❌ Unexpected authentication error:', error);
    next(error);
  }
};