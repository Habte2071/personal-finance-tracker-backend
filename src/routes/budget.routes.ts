import { Router } from 'express';
import { budgetController, budgetSchema, updateBudgetSchema } from '../controllers/budget.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', budgetController.getAll);
router.get('/alerts', budgetController.getAlerts);
router.get('/:id', budgetController.getById);
router.post('/', validate(budgetSchema), budgetController.create);
// TEST: Bypass validation for update
router.patch('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;