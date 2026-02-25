import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        first_name: z.ZodOptional<z.ZodString>;
        last_name: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        currency?: string | undefined;
    }, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        currency?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        first_name?: string | undefined;
        last_name?: string | undefined;
        currency?: string | undefined;
    };
}, {
    body: {
        first_name?: string | undefined;
        last_name?: string | undefined;
        currency?: string | undefined;
    };
}>;
declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}>;
export declare class UserController {
    getProfile: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    updateProfile: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    changePassword: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
export declare const userController: UserController;
export { updateProfileSchema, changePasswordSchema };
//# sourceMappingURL=user.controller.d.ts.map