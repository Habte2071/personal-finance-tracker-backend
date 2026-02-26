import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
declare const dateRangeSchema: z.ZodObject<{
    query: z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        months: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        months: number;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        months?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        months: number;
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}, {
    query: {
        startDate?: string | undefined;
        endDate?: string | undefined;
        months?: number | undefined;
    };
}>;
export declare class DashboardController {
    getStats: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    getMonthlyTrend: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    getExpenseByCategory: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    getRecentTransactions: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
export declare const dashboardController: DashboardController;
export { dateRangeSchema };
//# sourceMappingURL=dashboard.controller.d.ts.map