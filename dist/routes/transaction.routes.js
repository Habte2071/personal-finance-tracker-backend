"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply authenticate to ALL routes
router.use(auth_middleware_1.authenticate);
// Test route without validation first
router.patch('/:id', transaction_controller_1.transactionController.update);
// Other routes...
router.get('/', (0, validation_middleware_1.validate)(transaction_controller_1.querySchema), transaction_controller_1.transactionController.getAll);
router.get('/summary', transaction_controller_1.transactionController.getSummary);
router.get('/:id', transaction_controller_1.transactionController.getById);
router.post('/', (0, validation_middleware_1.validate)(transaction_controller_1.transactionSchema), transaction_controller_1.transactionController.create);
router.delete('/:id', transaction_controller_1.transactionController.delete);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map