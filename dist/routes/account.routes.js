"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ✅ Apply authenticate to ALL routes below
router.use(auth_middleware_1.authenticate);
router.get('/', account_controller_1.accountController.getAll);
router.get('/:id', account_controller_1.accountController.getById);
router.post('/', (0, validation_middleware_1.validate)(account_controller_1.accountSchema), account_controller_1.accountController.create);
// TEST: Remove validation for update to test if req.user issue is resolved
router.patch('/:id', account_controller_1.accountController.update);
router.delete('/:id', account_controller_1.accountController.delete);
exports.default = router;
//# sourceMappingURL=account.routes.js.map