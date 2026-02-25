"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBudgetSchema = exports.budgetSchema = exports.budgetController = exports.BudgetController = void 0;
const zod_1 = require("zod");
const budget_service_1 = require("../services/budget.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const budgetSchema = zod_1.z.object({
    body: zod_1.z.object({
        category_id: zod_1.z.number().int().positive('Invalid category ID'),
        amount: zod_1.z.number().positive('Amount must be positive'),
        period: zod_1.z.enum(['weekly', 'monthly', 'yearly']),
        start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
        end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        alert_threshold: zod_1.z.number().min(0).max(100).optional(),
    }),
});
exports.budgetSchema = budgetSchema;
const updateBudgetSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive().optional(),
        period: zod_1.z.enum(['weekly', 'monthly', 'yearly']).optional(),
        start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
        alert_threshold: zod_1.z.number().min(0).max(100).optional(),
    }),
});
exports.updateBudgetSchema = updateBudgetSchema;
class BudgetController {
    getAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const budgets = await budget_service_1.budgetService.getAllBudgets(req.user.id);
        (0, apiResponse_utils_1.successResponse)(res, budgets, 'Budgets retrieved successfully');
    });
    getById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const id = Number(req.params.id);
        const budget = await budget_service_1.budgetService.getBudgetById(req.user.id, id);
        (0, apiResponse_utils_1.successResponse)(res, budget, 'Budget retrieved successfully');
    });
    create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const data = req.body;
        const budget = await budget_service_1.budgetService.createBudget(req.user.id, data);
        (0, apiResponse_utils_1.successResponse)(res, budget, 'Budget created successfully', 201);
    });
    update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const id = Number(req.params.id);
        const data = req.body;
        const budget = await budget_service_1.budgetService.updateBudget(req.user.id, id, data);
        (0, apiResponse_utils_1.successResponse)(res, budget, 'Budget updated successfully');
    });
    delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const id = Number(req.params.id);
        await budget_service_1.budgetService.deleteBudget(req.user.id, id);
        (0, apiResponse_utils_1.successResponse)(res, null, 'Budget deleted successfully');
    });
    getAlerts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const alerts = await budget_service_1.budgetService.getBudgetAlerts(req.user.id);
        (0, apiResponse_utils_1.successResponse)(res, alerts, 'Budget alerts retrieved successfully');
    });
}
exports.BudgetController = BudgetController;
exports.budgetController = new BudgetController();
//# sourceMappingURL=budget.controller.js.map