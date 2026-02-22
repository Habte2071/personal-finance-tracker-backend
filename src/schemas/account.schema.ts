// src/schemas/account.schema.ts
// (only the update-related schema — you can keep other schemas in the same file)

import { z } from 'zod';

export const accountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Account name is required'),
    type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']),
    balance: z.number().optional(),
    currency: z.string().length(3).optional(),
    description: z.string().optional(),
  }),
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Account name must be at least 1 character').optional(),
    type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other']).optional(),
    balance: z.number().optional(),
    currency: z.string().length(3, 'Currency must be 3-letter code (USD, EUR, etc.)').optional(),
    description: z.string().max(500).optional().nullable(),
    is_active: z.boolean().optional(),
  })
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "At least one field must be provided to update the account (name, type, balance, currency, description, is_active)" }
    ),
});