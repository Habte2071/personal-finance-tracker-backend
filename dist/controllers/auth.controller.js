"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = exports.authController = exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        first_name: zod_1.z.string().min(1, 'First name is required'),
        last_name: zod_1.z.string().min(1, 'Last name is required'),
        currency: zod_1.z.string().length(3).optional(),
    }),
});
exports.registerSchema = registerSchema;
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.loginSchema = loginSchema;
const refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
exports.refreshSchema = refreshSchema;
class AuthController {
    register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.register(req.body);
        (0, apiResponse_utils_1.successResponse)(res, result, 'User registered successfully', 201);
    });
    login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.login(req.body);
        (0, apiResponse_utils_1.successResponse)(res, result, 'Login successful');
    });
    refreshToken = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { refreshToken } = req.body;
        const result = await auth_service_1.authService.refreshToken(refreshToken);
        (0, apiResponse_utils_1.successResponse)(res, result, 'Token refreshed successfully');
    });
    getMe = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = req.user;
        (0, apiResponse_utils_1.successResponse)(res, {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            currency: user.currency,
            created_at: user.created_at,
        }, 'User profile retrieved');
    });
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map