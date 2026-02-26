import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
declare const transactionSchema: z.ZodObject<{
    body: z.ZodObject<{
        account_id: z.ZodNumber;
        category_id: z.ZodOptional<z.ZodNumber>;
        type: z.ZodEnum<["income", "expense", "transfer"]>;
        amount: z.ZodNumber;
        description: z.ZodString;
        transaction_date: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "income" | "expense" | "transfer";
        description: string;
        account_id: number;
        amount: number;
        transaction_date: string;
        category_id?: number | undefined;
        notes?: string | undefined;
    }, {
        type: "income" | "expense" | "transfer";
        description: string;
        account_id: number;
        amount: number;
        transaction_date: string;
        category_id?: number | undefined;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type: "income" | "expense" | "transfer";
        description: string;
        account_id: number;
        amount: number;
        transaction_date: string;
        category_id?: number | undefined;
        notes?: string | undefined;
    };
}, {
    body: {
        type: "income" | "expense" | "transfer";
        description: string;
        account_id: number;
        amount: number;
        transaction_date: string;
        category_id?: number | undefined;
        notes?: string | undefined;
    };
}>;
declare const updateTransactionSchema: z.ZodObject<{
    body: z.ZodObject<{
        account_id: z.ZodOptional<z.ZodNumber>;
        category_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        type: z.ZodOptional<z.ZodEnum<["income", "expense", "transfer"]>>;
        amount: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
        transaction_date: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type?: "income" | "expense" | "transfer" | undefined;
        description?: string | undefined;
        account_id?: number | undefined;
        category_id?: number | null | undefined;
        amount?: number | undefined;
        transaction_date?: string | undefined;
        notes?: string | null | undefined;
    }, {
        type?: "income" | "expense" | "transfer" | undefined;
        description?: string | undefined;
        account_id?: number | undefined;
        category_id?: number | null | undefined;
        amount?: number | undefined;
        transaction_date?: string | undefined;
        notes?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type?: "income" | "expense" | "transfer" | undefined;
        description?: string | undefined;
        account_id?: number | undefined;
        category_id?: number | null | undefined;
        amount?: number | undefined;
        transaction_date?: string | undefined;
        notes?: string | null | undefined;
    };
}, {
    body: {
        type?: "income" | "expense" | "transfer" | undefined;
        description?: string | undefined;
        account_id?: number | undefined;
        category_id?: number | null | undefined;
        amount?: number | undefined;
        transaction_date?: string | undefined;
        notes?: string | null | undefined;
    };
}>;
declare const querySchema: z.ZodObject<{
    query: z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        accountId: z.ZodOptional<z.ZodNumber>;
        categoryId: z.ZodOptional<z.ZodNumber>;
        type: z.ZodOptional<z.ZodEnum<["income", "expense", "transfer"]>>;
        minAmount: z.ZodOptional<z.ZodNumber>;
        maxAmount: z.ZodOptional<z.ZodNumber>;
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        type?: "income" | "expense" | "transfer" | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        accountId?: number | undefined;
        categoryId?: number | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    }, {
        type?: "income" | "expense" | "transfer" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        accountId?: number | undefined;
        categoryId?: number | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        type?: "income" | "expense" | "transfer" | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        accountId?: number | undefined;
        categoryId?: number | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    };
}, {
    query: {
        type?: "income" | "expense" | "transfer" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        accountId?: number | undefined;
        categoryId?: number | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    };
}>;
export declare class TransactionController {
    getAll: (req: AuthRequest, res: Response, next: NextFunction) => void;
    getById: (req: AuthRequest, res: Response, next: NextFunction) => void;
    create: (req: AuthRequest, res: Response, next: NextFunction) => void;
    update: (req: AuthRequest, res: Response, next: NextFunction) => void;
    delete: (req: AuthRequest, res: Response, next: NextFunction) => void;
    getSummary: (req: AuthRequest, res: Response, next: NextFunction) => void;
}
export declare const transactionController: TransactionController;
export { transactionSchema, updateTransactionSchema, querySchema };
//# sourceMappingURL=transaction.controller.d.ts.map