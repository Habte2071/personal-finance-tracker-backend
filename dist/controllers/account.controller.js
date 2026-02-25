"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountSchema = exports.accountSchema = exports.accountController = exports.AccountController = void 0;
const zod_1 = require("zod");
const account_service_1 = require("../services/account.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const error_middleware_2 = require("../middleware/error.middleware");
const config_1 = __importDefault(require("../config"));
const accountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Account name is required'),
        type: zod_1.z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']),
        balance: zod_1.z.number().optional(),
        currency: zod_1.z.string().length(3).optional(),
        description: zod_1.z.string().optional(),
    }),
});
exports.accountSchema = accountSchema;
const updateAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        type: zod_1.z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']).optional(),
        balance: zod_1.z.number().optional(),
        currency: zod_1.z.string().length(3).optional(),
        description: zod_1.z.string().optional().nullable(),
        is_active: zod_1.z.boolean().optional(),
    }),
});
exports.updateAccountSchema = updateAccountSchema;
class AccountController {
    getAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const accounts = await account_service_1.accountService.getAllAccounts(req.user.id);
        (0, apiResponse_utils_1.successResponse)(res, accounts, 'Accounts retrieved successfully');
    });
    getById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid account ID', 400);
        const account = await account_service_1.accountService.getAccountById(req.user.id, id);
        (0, apiResponse_utils_1.successResponse)(res, account, 'Account retrieved successfully');
    });
    create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const data = req.body;
        const account = await account_service_1.accountService.createAccount(req.user.id, data);
        (0, apiResponse_utils_1.successResponse)(res, account, 'Account created successfully', 201);
    });
    update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        config_1.default.debug('=== UPDATE ACCOUNT CONTROLLER START ===');
        config_1.default.debug('req.user: ' + JSON.stringify(req.user));
        // CRITICAL: Check if req.user exists (same pattern as transaction)
        if (!req.user) {
            config_1.default.error('update: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id; // This was failing - req.user was undefined
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid account ID', 400);
        const data = req.body;
        config_1.default.debug('Updating account: ' + JSON.stringify({ userId, accountId: id, data }));
        const account = await account_service_1.accountService.updateAccount(userId, id, data);
        (0, apiResponse_utils_1.successResponse)(res, account, 'Account updated successfully');
    });
    delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid account ID', 400);
        await account_service_1.accountService.deleteAccount(req.user.id, id);
        (0, apiResponse_utils_1.successResponse)(res, null, 'Account deleted successfully');
    });
}
exports.AccountController = AccountController;
exports.accountController = new AccountController();
//# sourceMappingURL=account.controller.js.map