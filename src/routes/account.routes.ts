import { Router } from 'express';
import { accountController, accountSchema, updateAccountSchema } from '../controllers/account.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate); // All routes below require authentication

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', validate(accountSchema), accountController.create);
router.patch('/:id', validate(updateAccountSchema), accountController.update);
router.delete('/:id', accountController.delete);

export default router;