import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/monthly-trend', dashboardController.getMonthlyTrend);
router.get('/expense-by-category', dashboardController.getExpenseByCategory);
router.get('/recent-transactions', dashboardController.getRecentTransactions);

export default router;