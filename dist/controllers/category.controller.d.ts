import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
declare const categorySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["income", "expense"]>;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "income" | "expense";
        name: string;
        color?: string | undefined;
        icon?: string | undefined;
    }, {
        type: "income" | "expense";
        name: string;
        color?: string | undefined;
        icon?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type: "income" | "expense";
        name: string;
        color?: string | undefined;
        icon?: string | undefined;
    };
}, {
    body: {
        type: "income" | "expense";
        name: string;
        color?: string | undefined;
        icon?: string | undefined;
    };
}>;
declare const updateCategorySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["income", "expense"]>>;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "income" | "expense" | undefined;
        name?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }, {
        type?: "income" | "expense" | undefined;
        name?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type?: "income" | "expense" | undefined;
        name?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    };
}, {
    body: {
        type?: "income" | "expense" | undefined;
        name?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    };
}>;
export declare class CategoryController {
    getAll: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    getById: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    create: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    update: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    delete: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
export declare const categoryController: CategoryController;
export { categorySchema, updateCategorySchema };
//# sourceMappingURL=category.controller.d.ts.map