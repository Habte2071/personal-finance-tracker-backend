"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budget_controller_1 = require("../controllers/budget.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', budget_controller_1.budgetController.getAll);
router.get('/alerts', budget_controller_1.budgetController.getAlerts);
router.get('/:id', budget_controller_1.budgetController.getById);
router.post('/', (0, validation_middleware_1.validate)(budget_controller_1.budgetSchema), budget_controller_1.budgetController.create);
// TEST: Bypass validation for update
router.patch('/:id', budget_controller_1.budgetController.update);
router.delete('/:id', budget_controller_1.budgetController.delete);
exports.default = router;
//# sourceMappingURL=budget.routes.js.map