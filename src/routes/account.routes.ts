import { Router } from 'express';
import { accountController, accountSchema, updateAccountSchema } from '../controllers/account.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ✅ Apply authenticate to ALL routes below
router.use(authenticate);

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', validate(accountSchema), accountController.create);
// TEST: Remove validation for update to test if req.user issue is resolved
router.patch('/:id', accountController.update);
router.delete('/:id', accountController.delete);

export default router;