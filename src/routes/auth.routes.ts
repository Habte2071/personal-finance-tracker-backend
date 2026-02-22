import { Router } from 'express';
import { authController, registerSchema, loginSchema, refreshSchema } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refreshToken);

// Protected route
router.get('/me', authenticate, authController.getMe);

export default router;