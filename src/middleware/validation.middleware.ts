import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../config/index';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // CRITICAL: Store user before validation
      const user = (req as any).user;
      
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      
      // Assign validated data
      req.body = result.data.body;
      req.query = result.data.query;
      req.params = result.data.params;
      
      // CRITICAL: Restore user if it was lost during validation
      if (user && !(req as any).user) {
        (req as any).user = user;
      }
      
      next();
    } catch (error) {
      logger.error('Unexpected validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during validation',
      });
    }
  };
};