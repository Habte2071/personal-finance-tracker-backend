import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
declare const budgetSchema: z.ZodObject<{
    body: z.ZodObject<{
        category_id: z.ZodNumber;
        amount: z.ZodNumber;
        period: z.ZodEnum<["weekly", "monthly", "yearly"]>;
        start_date: z.ZodString;
        end_date: z.ZodOptional<z.ZodString>;
        alert_threshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        category_id: number;
        amount: number;
        period: "weekly" | "monthly" | "yearly";
        start_date: string;
        end_date?: string | undefined;
        alert_threshold?: number | undefined;
    }, {
        category_id: number;
        amount: number;
        period: "weekly" | "monthly" | "yearly";
        start_date: string;
        end_date?: string | undefined;
        alert_threshold?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        category_id: number;
        amount: number;
        period: "weekly" | "monthly" | "yearly";
        start_date: string;
        end_date?: string | undefined;
        alert_threshold?: number | undefined;
    };
}, {
    body: {
        category_id: number;
        amount: number;
        period: "weekly" | "monthly" | "yearly";
        start_date: string;
        end_date?: string | undefined;
        alert_threshold?: number | undefined;
    };
}>;
declare const updateBudgetSchema: z.ZodObject<{
    body: z.ZodObject<{
        amount: z.ZodOptional<z.ZodNumber>;
        period: z.ZodOptional<z.ZodEnum<["weekly", "monthly", "yearly"]>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        alert_threshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        amount?: number | undefined;
        period?: "weekly" | "monthly" | "yearly" | undefined;
        start_date?: string | undefined;
        end_date?: string | null | undefined;
        alert_threshold?: number | undefined;
    }, {
        amount?: number | undefined;
        period?: "weekly" | "monthly" | "yearly" | undefined;
        start_date?: string | undefined;
        end_date?: string | null | undefined;
        alert_threshold?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        amount?: number | undefined;
        period?: "weekly" | "monthly" | "yearly" | undefined;
        start_date?: string | undefined;
        end_date?: string | null | undefined;
        alert_threshold?: number | undefined;
    };
}, {
    body: {
        amount?: number | undefined;
        period?: "weekly" | "monthly" | "yearly" | undefined;
        start_date?: string | undefined;
        end_date?: string | null | undefined;
        alert_threshold?: number | undefined;
    };
}>;
export declare class BudgetController {
    getAll: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    getById: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    create: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    update: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    delete: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    getAlerts: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
export declare const budgetController: BudgetController;
export { budgetSchema, updateBudgetSchema };
//# sourceMappingURL=budget.controller.d.ts.map