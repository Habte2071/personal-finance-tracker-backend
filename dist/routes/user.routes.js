"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/profile', user_controller_1.userController.getProfile);
router.patch('/profile', (0, validation_middleware_1.validate)(user_controller_1.updateProfileSchema), user_controller_1.userController.updateProfile);
router.post('/change-password', (0, validation_middleware_1.validate)(user_controller_1.changePasswordSchema), user_controller_1.userController.changePassword);
exports.default = router;
//# sourceMappingURL=user.routes.js.map