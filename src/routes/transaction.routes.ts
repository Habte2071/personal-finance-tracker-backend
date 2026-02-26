import { Router } from 'express';
import { transactionController, transactionSchema, updateTransactionSchema, querySchema } from '../controllers/transaction.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authenticate to ALL routes
router.use(authenticate);

// Test route without validation first
router.patch('/:id', transactionController.update);

// Other routes...
router.get('/', validate(querySchema), transactionController.getAll);
router.get('/summary', transactionController.getSummary);
router.get('/:id', transactionController.getById);
router.post('/', validate(transactionSchema), transactionController.create);
router.delete('/:id', transactionController.delete);

export default router;