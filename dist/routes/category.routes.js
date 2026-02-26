"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// In category.routes.ts - TEMPORARY TEST
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', category_controller_1.categoryController.getAll);
router.get('/:id', category_controller_1.categoryController.getById);
router.post('/', (0, validation_middleware_1.validate)(category_controller_1.categorySchema), category_controller_1.categoryController.create);
// TEST: Remove validation for update
router.patch('/:id', category_controller_1.categoryController.update);
router.delete('/:id', category_controller_1.categoryController.delete);
exports.default = router;
//# sourceMappingURL=category.routes.js.map