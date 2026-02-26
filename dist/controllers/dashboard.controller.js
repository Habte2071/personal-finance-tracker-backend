"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRangeSchema = exports.dashboardController = exports.DashboardController = void 0;
const zod_1 = require("zod");
const dashboard_service_1 = require("../services/dashboard.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const dateRangeSchema = zod_1.z.object({
    query: zod_1.z.object({
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        months: zod_1.z.coerce.number().default(6),
    }),
});
exports.dateRangeSchema = dateRangeSchema;
class DashboardController {
    getStats = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const stats = await dashboard_service_1.dashboardService.getDashboardStats(req.user.id);
        (0, apiResponse_utils_1.successResponse)(res, stats, 'Dashboard stats retrieved successfully');
    });
    getMonthlyTrend = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const months = req.query.months ? Number(req.query.months) : 6;
        const trend = await dashboard_service_1.dashboardService.getMonthlyTrend(req.user.id, months);
        (0, apiResponse_utils_1.successResponse)(res, trend, 'Monthly trend retrieved successfully');
    });
    getExpenseByCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { startDate, endDate } = req.query;
        const summary = await dashboard_service_1.dashboardService.getExpenseByCategory(req.user.id, startDate, endDate);
        (0, apiResponse_utils_1.successResponse)(res, summary, 'Expense by category retrieved successfully');
    });
    getRecentTransactions = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const transactions = await dashboard_service_1.dashboardService.getRecentTransactions(req.user.id, limit);
        (0, apiResponse_utils_1.successResponse)(res, transactions, 'Recent transactions retrieved successfully');
    });
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map