"use strict";
// src/schemas/account.schema.ts
// (only the update-related schema — you can keep other schemas in the same file)
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountSchema = exports.accountSchema = void 0;
const zod_1 = require("zod");
exports.accountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Account name is required'),
        type: zod_1.z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']),
        balance: zod_1.z.number().optional(),
        currency: zod_1.z.string().length(3).optional(),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Account name must be at least 1 character').optional(),
        type: zod_1.z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']).optional(),
        balance: zod_1.z.number().optional(),
        currency: zod_1.z.string().length(3, 'Currency must be 3-letter code (USD, EUR, etc.)').optional(),
        description: zod_1.z.string().max(500).optional().nullable(),
        is_active: zod_1.z.boolean().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided to update the account (name, type, balance, currency, description, is_active)" }),
});
//# sourceMappingURL=account.schema.js.map