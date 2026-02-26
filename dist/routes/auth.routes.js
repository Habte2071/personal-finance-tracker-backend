"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validation_middleware_1.validate)(auth_controller_1.registerSchema), auth_controller_1.authController.register);
router.post('/login', (0, validation_middleware_1.validate)(auth_controller_1.loginSchema), auth_controller_1.authController.login);
router.post('/refresh', (0, validation_middleware_1.validate)(auth_controller_1.refreshSchema), auth_controller_1.authController.refreshToken);
// Protected route
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map