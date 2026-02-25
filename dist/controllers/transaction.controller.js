"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySchema = exports.updateTransactionSchema = exports.transactionSchema = exports.transactionController = exports.TransactionController = void 0;
const zod_1 = require("zod");
const transaction_service_1 = require("../services/transaction.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const error_middleware_2 = require("../middleware/error.middleware");
const config_1 = __importDefault(require("../config"));
const transactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        account_id: zod_1.z.number().int().positive('Invalid account ID'),
        category_id: zod_1.z.number().int().positive().optional(),
        type: zod_1.z.enum(['income', 'expense', 'transfer']),
        amount: zod_1.z.number().positive('Amount must be positive'),
        description: zod_1.z.string().min(1, 'Description is required'),
        transaction_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        notes: zod_1.z.string().optional(),
    }),
});
exports.transactionSchema = transactionSchema;
const updateTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        account_id: zod_1.z.number().int().positive().optional(),
        category_id: zod_1.z.number().int().positive().nullable().optional(),
        type: zod_1.z.enum(['income', 'expense', 'transfer']).optional(),
        amount: zod_1.z.number().positive().optional(),
        description: zod_1.z.string().min(1).optional(),
        transaction_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        notes: zod_1.z.string().nullable().optional(),
    }),
});
exports.updateTransactionSchema = updateTransactionSchema;
const querySchema = zod_1.z.object({
    query: zod_1.z.object({
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        accountId: zod_1.z.coerce.number().int().positive().optional(),
        categoryId: zod_1.z.coerce.number().int().positive().optional(),
        type: zod_1.z.enum(['income', 'expense', 'transfer']).optional(),
        minAmount: zod_1.z.coerce.number().optional(),
        maxAmount: zod_1.z.coerce.number().optional(),
        page: zod_1.z.coerce.number().default(1),
        limit: zod_1.z.coerce.number().max(100).default(20),
    }),
});
exports.querySchema = querySchema;
class TransactionController {
    // FIXED: Use AuthRequest explicitly in asyncHandler
    getAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        // DEBUG: Check if user exists
        if (!req.user) {
            config_1.default.error('getAll: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id;
        config_1.default.debug('getAll: userId =', userId);
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            accountId: req.query.accountId ? Number(req.query.accountId) : undefined,
            categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
            type: req.query.type,
            minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
            maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 20,
        };
        const { transactions, total } = await transaction_service_1.transactionService.getTransactions(userId, filters);
        (0, apiResponse_utils_1.paginatedResponse)(res, transactions, total, filters.page || 1, filters.limit || 20, 'Transactions retrieved successfully');
    });
    getById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            config_1.default.error('getById: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id;
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid transaction ID', 400);
        const transaction = await transaction_service_1.transactionService.getTransactionById(userId, id);
        (0, apiResponse_utils_1.successResponse)(res, transaction, 'Transaction retrieved successfully');
    });
    create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            config_1.default.error('create: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id;
        const data = req.body;
        const transaction = await transaction_service_1.transactionService.createTransaction(userId, data);
        (0, apiResponse_utils_1.successResponse)(res, transaction, 'Transaction created successfully', 201);
    });
    update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        config_1.default.debug('=== UPDATE CONTROLLER START ===');
        config_1.default.debug('req.user:', req.user);
        config_1.default.debug('req.body:', req.body);
        config_1.default.debug('req.params:', req.params);
        if (!req.user) {
            config_1.default.error('update: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id;
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid transaction ID', 400);
        const data = req.body;
        config_1.default.debug('Updating transaction:', { userId, transactionId: id, data });
        const transaction = await transaction_service_1.transactionService.updateTransaction(userId, id, data);
        (0, apiResponse_utils_1.successResponse)(res, transaction, 'Transaction updated successfully');
    });
    delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            config_1.default.error('delete: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id;
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid transaction ID', 400);
        await transaction_service_1.transactionService.deleteTransaction(userId, id);
        (0, apiResponse_utils_1.successResponse)(res, null, 'Transaction deleted successfully');
    });
    getSummary = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            config_1.default.error('getSummary: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        const summary = await transaction_service_1.transactionService.getTransactionSummary(userId, startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], endDate || new Date().toISOString().split('T')[0]);
        (0, apiResponse_utils_1.successResponse)(res, summary, 'Transaction summary retrieved successfully');
    });
}
exports.TransactionController = TransactionController;
exports.transactionController = new TransactionController();
//# sourceMappingURL=transaction.controller.js.map