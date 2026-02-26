"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/stats', dashboard_controller_1.dashboardController.getStats);
router.get('/monthly-trend', dashboard_controller_1.dashboardController.getMonthlyTrend);
router.get('/expense-by-category', dashboard_controller_1.dashboardController.getExpenseByCategory);
router.get('/recent-transactions', dashboard_controller_1.dashboardController.getRecentTransactions);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map