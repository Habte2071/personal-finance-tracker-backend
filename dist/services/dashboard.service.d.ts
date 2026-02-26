import { DashboardStats, MonthlyData, CategorySummary, RecentTransaction } from '../types';
export declare class DashboardService {
    getDashboardStats(userId: number): Promise<DashboardStats>;
    getMonthlyTrend(userId: number, months?: number): Promise<MonthlyData[]>;
    getExpenseByCategory(userId: number, startDate?: string, endDate?: string): Promise<CategorySummary[]>;
    getRecentTransactions(userId: number, limit?: number): Promise<RecentTransaction[]>;
}
export declare const dashboardService: DashboardService;
//# sourceMappingURL=dashboard.service.d.ts.map