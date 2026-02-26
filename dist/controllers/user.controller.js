"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.userController = exports.UserController = void 0;
const zod_1 = require("zod");
const user_service_1 = require("../services/user.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        first_name: zod_1.z.string().min(1).optional(),
        last_name: zod_1.z.string().min(1).optional(),
        currency: zod_1.z.string().length(3).optional(),
    }),
});
exports.updateProfileSchema = updateProfileSchema;
const changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
    }),
});
exports.changePasswordSchema = changePasswordSchema;
class UserController {
    getProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = await user_service_1.userService.getProfile(req.user.id);
        (0, apiResponse_utils_1.successResponse)(res, user, 'Profile retrieved successfully');
    });
    updateProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = await user_service_1.userService.updateProfile(req.user.id, req.body);
        (0, apiResponse_utils_1.successResponse)(res, user, 'Profile updated successfully');
    });
    changePassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        await user_service_1.userService.changePassword(req.user.id, currentPassword, newPassword);
        (0, apiResponse_utils_1.successResponse)(res, null, 'Password changed successfully');
    });
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=user.controller.js.map